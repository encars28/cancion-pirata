from typing import Optional

from app.crud.base import CRUDRepository
from app.core.security import verify_password
from app.models.user import User

from sqlalchemy.orm import Session

class UserRepository(CRUDRepository):
    def authenticate(self, session: Session, email: str, password: str) -> Optional[User]:
        db_user = self.get_one(session, User.email == email)
        if not db_user:
            return None
        if not verify_password(password, db_user.hashed_password):
            return None
        
        return db_user
    
user_crud = UserRepository(model=User)