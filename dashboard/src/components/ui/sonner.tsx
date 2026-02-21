import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme()

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-bg-elevated group-[.toaster]:text-text-primary group-[.toaster]:border-border group-[.toaster]:shadow-lg",
                    description: "group-[.toast]:text-text-dim",
                    actionButton:
                        "group-[.toast]:bg-accent-acid group-[.toast]:text-accent-acid-fg",
                    cancelButton:
                        "group-[.toast]:bg-bg-subtle group-[.toast]:text-text-dim",
                },
            }}
            {...props}
        />
    )
}

export { Toaster }
