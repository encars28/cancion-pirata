import { TbUser } from "react-icons/tb";
import { HeaderControl } from '../HeaderControl';
import classes from './LoginControl.module.css';
import { useNavigate } from 'react-router';

export function LoginControl() {
  const navigate = useNavigate();
  return (
    <HeaderControl
      tooltip="Login"
      className={classes.control}
      onClick={() => navigate("/login")}
    >
      <TbUser size={22} />
    </HeaderControl>
  );
}