import { Share2, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ShareButtonProps {
    title: string;
    text: string;
    url?: string;
    className?: string;
    variant?: "ghost" | "outline" | "default" | "secondary";
    size?: "default" | "sm" | "lg" | "icon";
}

export function ShareButton({ title, text, url, className, variant = "ghost", size = "icon" }: ShareButtonProps) {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const shareData = {
            title,
            text,
            url: url || window.location.href,
        };

        if (navigator.share && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                if ((error as Error).name !== "AbortError") {
                    console.error("Error sharing", error);
                }
            }
        } else {
            // Fallback to copy
            const contentToCopy = `${title}\n\n${text}\n\n${url || ""}`;
            try {
                await navigator.clipboard.writeText(contentToCopy);
                setCopied(true);
                toast({ title: "Copied to clipboard" });
                setTimeout(() => setCopied(false), 2000);
            } catch (error) {
                toast({ title: "Failed to copy", variant: "destructive" });
            }
        }
    };

    return (
        <Button variant={variant} size={size} className={className} onClick={handleShare}>
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
        </Button>
    );
}
