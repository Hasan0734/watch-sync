import { Copy, CopyIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../ui/input-group";
import { PopoverContent, PopoverHeader, PopoverTitle } from "../ui/popover";
import { useLocation } from "@tanstack/react-router";
import { APP_URL } from "#/lib/utils";

const InviteModal = () => {
  const { pathname } = useLocation();

  const handleContentCopy = async () => {
    const url = APP_URL + pathname;
    try {
      await navigator.clipboard.writeText(url);
    } catch (error: any) {
      console.error(error.message);
    }
  };

  return (
    <PopoverContent side="bottom" align="end">
      <PopoverHeader>
        <PopoverTitle>Invite friends and watch together!</PopoverTitle>
      </PopoverHeader>
      <div>
        <InputGroup>
          <InputGroupInput value={APP_URL + pathname} readOnly />
          <InputGroupAddon align={"inline-end"}>
            <InputGroupButton
              onClick={handleContentCopy}
              size="icon-xs"
              className="ml-auto"
            >
              <CopyIcon />
              <span className="sr-only">Copy</span>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </PopoverContent>
  );
};

export default InviteModal;
