import { TbSearch } from "react-icons/tb";
import { HeaderControl } from '../../HeaderControl';
import { searchHandlers } from '../Search';
import classes from './SearchControlMobile.module.css';

export function SearchControlMobile() {
  return (
    <HeaderControl
      tooltip="Buscar"
      className={classes.control}
      onClick={searchHandlers.open}
    >
      <TbSearch size={22} />
    </HeaderControl>
  );
}