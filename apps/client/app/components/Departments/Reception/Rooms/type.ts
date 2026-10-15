
export type RoomStatus = 'Available' | 'Occupied' | 'Checkout Due' | 'Overdue';
export type RoomType = 'Standard Room' | 'Deluxe Room' | 'Premium Room' | 'Executive Suite';

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
