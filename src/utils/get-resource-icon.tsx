import {
	FileDocIcon,
	FileMdIcon,
	FilePdfIcon,
	FileTextIcon,
	FileTxtIcon,
	LinkIcon,
	TextAlignLeftIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export const getResourceIcon = (typeOrMimeType: string, className: string) => {
	switch (typeOrMimeType) {
		case "links":
			return <LinkIcon className={cn(className, "text-blue-500")} />;
		case "text":
			return (
				<TextAlignLeftIcon className={cn(className, "text-gray-500")} />
			);
		case "application/pdf":
			return (
				<FilePdfIcon
					weight="fill"
					className={cn(className, "text-red-500")}
				/>
			);
		case "text/markdown":
			return (
				<FileMdIcon
					weight="fill"
					className={cn(className, "text-green-500")}
				/>
			);
		case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
		case "application/msword":
			return (
				<FileDocIcon
					weight="fill"
					className={cn(className, "text-sky-500")}
				/>
			);
		case "text/plain":
			return (
				<FileTxtIcon
					weight="fill"
					className={cn(className, "text-purple-500")}
				/>
			);
		default:
			return <FileTextIcon className={className} />;
	}
};
