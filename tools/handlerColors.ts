type ColorFunction = { [key: string]: string };

export const getColors: ColorFunction = {
  Blue533: "#153557",
  Green808: "#00a087",
  Sky801: "#00b0d8",
  Orange804: "#ff7c00",
  White: "#F5F7F8",
  White_1: "#F5F7F8",
  White_2: "#F3F8FF",
};

// Function to return a random color from the getColors object, excluding specified colors
export function randomColorWithIntensity(except: { excepting?: string[] } = {}): string {
  const colors = Object.keys(getColors).filter(color => !except.excepting || !except.excepting.includes(color));
  if (colors.length === 0) return 'No available colors'; // Return a message if all colors are excluded

  const randomIndex = Math.floor(Math.random() * colors.length);
  const selectedColor = colors[randomIndex];

  return getColors[selectedColor];
}


