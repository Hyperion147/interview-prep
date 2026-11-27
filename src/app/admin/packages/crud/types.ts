export const packageCategories = ["domestic", "international"] as const;
export const packageStatuses = ["draft", "active", "inactive"] as const;
export type PackageCategory = (typeof packageCategories)[number];
export type PackageStatus = (typeof packageStatuses)[number];
export type TravelPackage = {
    id: string;
    name: string;
    category: PackageCategory;
    country: string;
    state: string;
    city: string;
    description: string;
    region: string;
    locationLabel: string;
    imageUrl: string;
    hotel: string;
    rating: number;
    features: string[];
    durationDays: number;
    durationNights: number;
    price: number;
    status: PackageStatus;
    createdAt: string;
    updatedAt: string;
};
export type PackageDraft = Omit<
    TravelPackage,
    "id" | "createdAt" | "updatedAt"
>;
export function normalizePackage(
    row: Omit<TravelPackage, "price" | "rating"> & {
        price: string | number;
        rating: string | number;
    },
): TravelPackage {
    return { ...row, price: Number(row.price), rating: Number(row.rating) };
}
