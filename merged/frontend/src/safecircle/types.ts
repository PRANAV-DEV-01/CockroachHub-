export interface StationLine {
  name: string;
  color: string;
}

export interface Station {
  id: string;
  name: string;
  lines: StationLine[];
  interchange: boolean;
  type: "Elevated" | "Underground";
  area: string;
  alternatives: string[];
  coordinates: { lat: number; lng: number };
}

export interface Disruption {
  stationId: string;
  status: "Open" | "Limited" | "Closed";
  reason: string;
  lastUpdated: string;
}

export interface MetroData {
  stations: Station[];
  disruptions: Disruption[];
  disruptionMap: Map<string, Disruption>;
  loading: boolean;
  error: Error | null;
}
