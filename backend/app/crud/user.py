from typing import Optional

from app.crud.base import CRUDRepository
from app.core.security import verify_password, get_password_hash
from app.models.user import User
from app.schemas.user import UserCreate, UserSchema, UserUpdate, UserUpdateMe

from sqlalchemy.orm import Session

class UserRepository(CRUDRepository):
    def create(self, db: Session, obj_create: UserCreate) -> User: # type: ignore
        obj_data = obj_create.model_dump(exclude_none=True, exclude_unset=True)
        obj_data["hashed_password"] = get_password_hash(obj_create.password)
        
        db_schema = UserSchema.model_validate(obj_data)
        obj_data = db_schema.model_dump(exclude_none=True, exclude_unset=True)
        
        db_obj = User(**obj_data)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj 
    
    def update(self, db: Session, db_obj: User, obj_update: UserUpdate | UserUpdateMe) -> User: # type: ignore
        user_data = obj_update.model_dump(exclude_unset=True)
        
        if "password" in user_data:
            user_data["hashed_password"] = get_password_hash(user_data["password"])
            del user_data["password"]
          
        for key, value in user_data.items():
            setattr(db_obj, key, value)
    
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def authenticate(self, db: Session, email: str, password: str) -> Optional[User]:
        db_user = self.get_one(db, User.email == email)
        if not db_user:
            return None
        if not verify_password(password, db_user.hashed_password):
            return None
        
        return db_user
    
user_crud = UserRepository(model=User, schema=UserSchema)