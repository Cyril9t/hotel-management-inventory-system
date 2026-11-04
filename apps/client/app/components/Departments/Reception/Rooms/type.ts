
export type RoomStatus = 'Available' | 'Occupied' | 'Checkout Due' | 'Overdue' | (string & {});
export type RoomType = 'Standard Room' | 'Deluxe Room' | 'Premium Room' | 'Executive Suite';

export function getRoomOccupancyMetrics(statuses: readonly unknown[]) {
    const normalizeStatus = (status: unknown) => String(status ?? '').trim().toUpperCase().replace(/[ _-]+/g, '_');
    const total = statuses.length;
    const available = statuses.filter((status) => normalizeStatus(status) === 'AVAILABLE').length;
    const occupied = total - available;

    return {
        total,
        available,
        occupied,
        percentage: total ? Math.round((occupied / total) * 100) : 0,
    };
}

/** Fields consumed from the Rooms API. The API's published schema leaves room items generic. */
export interface ApiRoom {
    id?: string;
    _id?: string;
    number?: string | number;
    status?: string;
    type?: string;
    category?: {
        name?: string;
        pricePerNight?: number;
        price_per_night?: number;
    };
    pricePerNight?: number;
    [key: string]: unknown;
}

export interface RoomsApiResponse {
    data?: { rooms?: ApiRoom[] } | ApiRoom[];
    rooms?: ApiRoom[];
}

export interface Room {
    id: string;
    number: string;
    type: RoomType;
    pricePerNight: number;
    bedCount: number;
    maxGuests: number;
    status: RoomStatus;
    occupancyProgress: number; // Percentage
    guestName?: string;
    guestGender?: string;
    guestPhone?: string;
    guestEmail?: string;
    stayStartDate?: string;
    stayEndDate?: string;
    stayNights?: number;
    floor?: string;
    wing?: string;
    image: string;
}
