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

const isUrl = (str: string) =>
  /^(https?:\/\/|magnet:\?)/i.test(str.trim());

const VideoInput = ({ videoUrl, handleVideoUrl }: PropsType) => {
  const [items, setItems] = useState(examples);
  const [searchTerm, setSearchTerm] = useState(videoUrl || "");

  useEffect(() => {
    setSearchTerm(videoUrl || "");
  }, [videoUrl]);

  useEffect(() => {
    const trimmed = searchTerm.trim();

    // 1. If empty or it's a URL -> DO NOT call API
    if (!trimmed || isUrl(trimmed)) {
      setItems(examples);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(
          `${API_URL}/youtube?q=${encodeURIComponent(trimmed)}`,
        );
        if (!response.ok) throw new Error("Network response failed");

        const data = await response.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching YouTube items:", error);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);

    if (isUrl(newValue)) {
      handleVideoUrl(newValue);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    handleVideoUrl("");
    setItems(examples);
  };

  return (
    <div className="">
      <Combobox
        items={items}
        value={videoUrl}
        onValueChange={(src) => {
          if (typeof src === "string") {
            handleVideoUrl(src);
            setSearchTerm(src);
          }
        }}
      >
        <InputGroup className={cn("w-auto")}>
          <ComboboxPrimitive.Input
            render={
              <InputGroupInput
                className="text-sm"
                value={searchTerm}
                onChange={handleInputChange}
                placeholder="Enter video file URL, magnet link, Youtube link, or Youtube search term."
              />
            }
          />

          <InputGroupAddon align="inline-end">
            <InputGroupButton
              onClick={handleClear}
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
                key={item.url}
                value={item.url}
              >
                <div className="flex">
                  <div className="border-r pr-2">
                    <img className="w-28 h-20 object-cover" src={item.img} alt={item.name} />
                  </div>
                  <div className="pl-2 flex items-center">
                    <h4 className="text-sm font-medium">{item.name}</h4>
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