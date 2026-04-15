export interface OrganizationLocation {
  lat: number;
  lng: number;
  addressString?: string;
}

export interface Organization {
  id: string;
  name: string;
  location: OrganizationLocation;
  createdAt: string;
}
