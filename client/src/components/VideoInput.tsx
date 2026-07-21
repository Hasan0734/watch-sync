import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
} from "./ui/combobox";
import { API_URL, cn } from "#/lib/utils";
import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group";
import { XIcon } from "lucide-react";
import { examples } from "#/lib/example";
import { useEffect, useState } from "react";
import { Spinner } from "./ui/spinner";

interface PropsType {
  videoUrl: string;
  handleVideoUrl: (url: string) => void;
}

const VideoInput = ({ videoUrl, handleVideoUrl }: PropsType) => {
  const [items, setItems] = useState(examples);
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce logic & API fetching
  useEffect(() => {
    if (!searchTerm.trim()) {
      setItems(examples);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(
          `${API_URL}/youtube?q=${encodeURIComponent(searchTerm)}`,
        );
        if (!response.ok) throw new Error("Network response failed");

        const data = await response.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching YouTube items:", error);
      }
    }, 500); // 500 milliseconds debounce window

    // Clean up the timer if the user types another character before 500ms passes
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="">
      <Combobox
        items={items}
        onValueChange={(src) => handleVideoUrl(src as string)}
      >
        <InputGroup className={cn("w-auto")}>
          <ComboboxPrimitive.Input
            render={
              <InputGroupInput
                onChange={(e) => setSearchTerm(e.target.value)}
                defaultValue={videoUrl || ""}
                placeholder="Enter video file URL, magnet link, Youtube link, or Youtube search term."
              />
            }
          />

          <InputGroupAddon align="inline-end">
            <InputGroupButton
              onClick={() => {
                setSearchTerm("");
                handleVideoUrl("");
              }}
              size="icon-xs"
              variant="ghost"
              asChild
              data-slot="input-group-button"
              className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent cursor-pointer"
            >
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <ComboboxContent>
          <ComboboxEmpty>
            <Spinner />
          </ComboboxEmpty>
          <ComboboxList className={"space-y-2"}>
            {(item) => (
              <ComboboxItem
                className={"border"}
                key={item.name}
                value={item.url}
              >
                <div className="flex">
                  <div className="border-r pr-2">
                    <img className="w-28 h-20" src={item.img} alt={item.name} />
                  </div>
                  <div className="pl-2">
                    <h4>{item.name}</h4>
                  </div>
                </div>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
};

export default VideoInput;
