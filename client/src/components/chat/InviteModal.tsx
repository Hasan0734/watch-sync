import { Copy } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import {
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
} from "../ui/popover";
import { useLocation } from "@tanstack/react-router";
import { APP_URL } from "#/lib/utils";

const InviteModal = () => {
    const {pathname} = useLocation()

    console.log(APP_URL)
    console.log(import.meta.env.VITE_APP_URL)
  return (
    <PopoverContent side="bottom" align="end" >
      <PopoverHeader>
        <PopoverTitle>Invite friends and watch together!</PopoverTitle>
      </PopoverHeader>
      <div>
        <InputGroup>
            
          <InputGroupInput value={APP_URL + pathname} />
          <InputGroupAddon align={'inline-end'}>
            <Copy />
          </InputGroupAddon>
        </InputGroup>
      </div>
    </PopoverContent>
  );
};

export default InviteModal;
