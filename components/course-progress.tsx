import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { isHexColor, getPrimaryColor, generateColorVariants } from "@/lib/colors";

interface CourseProgressProps {
  value: number;
  size?: "default" | "sm";
}

// Función para obtener estilos de texto dinámicos
const getTextColorStyles = () => {
  const primaryColor = getPrimaryColor();
  
  if (isHexColor(primaryColor)) {
    const variants = generateColorVariants(primaryColor);
    return {
      style: { color: variants[700] },
      isCustom: true,
    };
  }
  
  const colorName = primaryColor.toLowerCase();
  return {
    className: `text-${colorName}-700`,
    isCustom: false,
  };
};

const sizeByVariant = {
  default: "text-sm",
  sm: "text-xs",
};

export const CourseProgress = ({
  value,
  size,
}: CourseProgressProps) => {
  const textStyles = getTextColorStyles();
  
  return (
    <div>
      <Progress className="h-2" value={value} variant="default"/>
      <p
        className={cn(
          "font-medium mt-2",
          textStyles.isCustom ? "" : textStyles.className,
          sizeByVariant[size || "default"]
        )}
        style={textStyles.isCustom ? textStyles.style : undefined}
      >
        {Math.round(value)}% Completado
      </p>
    </div>
  );
};
