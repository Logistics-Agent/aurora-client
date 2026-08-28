export type RouteAlternative = {
  id: string;
  name: string;
  distance: string;
  duration: string;
  cost: string;
  risk: "Low" | "Medium";
  recommended: boolean;
  coordinates: Array<{ longitude: number; latitude: number }>;
};
