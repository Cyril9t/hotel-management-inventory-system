import type { AxiosInstance } from "axios";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";

type RoomCategory = { id: string; name: string; pricePerNight: number };

function RoomCreateDialog({ api, open, onOpenChange, onCreated }: { api: AxiosInstance; open: boolean; onOpenChange: (open: boolean) => void; onCreated: () => void }) {
    const [categories, setCategories] = useState<RoomCategory[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [categoryMode, setCategoryMode] = useState<"existing" | "new">("new");
    const [categoryName, setCategoryName] = useState("");
    const [pricePerNight, setPricePerNight] = useState("");
    const [number, setNumber] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [step, setStep] = useState<"category" | "room">("category");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        setCategoriesLoading(true);
        const create = void api.get("/rooms/categories").then((response) => {
            const payload = response.data?.data?.categories ?? response.data?.data ?? response.data?.categories ?? [];
            console.log(payload)
            if (!cancelled) {
                const nextCategories = (Array.isArray(payload) ? payload : []).map((category: any) => ({ id: String(category.id ?? category._id), name: category.name, pricePerNight: Number(category.pricePerNight ?? category.price_per_night ?? 0) }));
                setCategories(nextCategories);
                setCategoryId((current) => nextCategories.some((category) => category.id === current) ? current : nextCategories[0]?.id || "");
            }

        }).catch(() => {
            if (!cancelled) setCategories([]);
        }).finally(() => { if (!cancelled) setCategoriesLoading(false); });
        return () => { cancelled = true; };
    }, [api, open]);

    function changeOpen(nextOpen: boolean) {
        if (!nextOpen) {
            setStep("category");
            setCategoryMode("new");
            setCategoryName("");
            setPricePerNight("");
            setNumber("");
        }
        onOpenChange(nextOpen);
    }

    async function submitCategory(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (categoryMode === "existing" && !categoryId) return;
        if (categoryMode === "new" && (!categoryName.trim() || !pricePerNight || Number(pricePerNight) <= 0)) return;
        setSubmitting(true);
        try {
            let nextCategoryId = categoryId;
            if (categoryMode === "new") {
                const response = await api.post("/rooms/categories", {
                    name: categoryName.trim(),
                    pricePerNight: Number(pricePerNight),
                });
                const payload = response.data?.data?.category ?? response.data?.data ?? response.data?.category;
                nextCategoryId = String(payload?.id ?? payload?._id ?? "");
                if (!nextCategoryId || nextCategoryId === "undefined") {
                    throw new Error("The API did not return the created room category ID.");
                }
                setCategories((current) => [...current, {
                    id: nextCategoryId,
                    name: String(payload.name ?? categoryName.trim()),
                    pricePerNight: Number(payload.pricePerNight ?? pricePerNight),
                }]);
                setCategoryId(nextCategoryId);
            }
            setStep("room");
            toast.success("Room category and price are ready. Add a room number.");
        } catch {
            // The shared API interceptor shows the request error.
        } finally {
            setSubmitting(false);
        }
    }

    async function submitRoom(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!number.trim() || !categoryId) return;
        setSubmitting(true);
        try {
            await api.post("/rooms", { number: number.trim(), categoryId });
            toast.success(`Room ${number.trim()} created`);
            setNumber("");
            changeOpen(false);
            onCreated();
        } catch {
            // Keep the selected category so the room request can be retried.
        } finally {
            setSubmitting(false);
        }
    }

    return <Dialog open={open} onOpenChange={changeOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="text-xl font-bold">{step === "category" ? "Room category and price" : "Add a reception room"}</DialogTitle><DialogDescription>{step === "category" ? "Choose a priced category or create one before adding a room." : `The room will use ${categories.find((category) => category.id === categoryId)?.name ?? "the selected category"} and its nightly price.`}</DialogDescription></DialogHeader>
            {step === "category" ? <form onSubmit={(event) => void submitCategory(event)} className="space-y-4">
                <div className="flex gap-2"><Button type="button" variant={categoryMode === "new" ? "default" : "outline"} className="bg-brand-navy text-background h-10" onClick={() => setCategoryMode("new")}>Create category</Button><Button type="button" className="h-10" variant={categoryMode === "existing" ? "default" : "outline"} onClick={() => setCategoryMode("existing")} disabled={!categories.length}>Use existing</Button></div>
                {categoryMode === "new" ? <>
                    <div className="space-y-1.5"><label htmlFor="room-category-name" className="text-sm font-medium">Category name</label><input id="room-category-name" autoFocus required value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="e.g. Deluxe Suite" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" /></div>
                    <div className="space-y-1.5"><label htmlFor="room-category-price" className="text-sm font-medium">Price per night (₦)</label><input id="room-category-price" type="number" min="0.01" step="0.01" required value={pricePerNight} onChange={(event) => setPricePerNight(event.target.value)} placeholder="e.g. 45000" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" /></div>
                </> : <div className="space-y-1.5"><label htmlFor="room-category" className="text-sm font-medium">Room category</label><select id="room-category" required value={categoryId} onChange={(event) => setCategoryId(event.target.value)} disabled={categoriesLoading || !categories.length} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"><option value="">{categoriesLoading ? "Loading categories…" : "Select a category"}</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name} · ₦{category.pricePerNight.toLocaleString()} / night</option>)}</select></div>}
                <DialogFooter className="-mx-4 -mb-4 mt-6 flex-row justify-end"><Button type="button" variant="outline" className="h-10" onClick={() => changeOpen(false)}>Cancel</Button><Button type="submit" disabled={submitting || categoriesLoading || (categoryMode === "existing" && !categoryId) || (categoryMode === "new" && (!categoryName.trim() || !pricePerNight || Number(pricePerNight) <= 0))} className="gap-2 h-10">{submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}{submitting ? "Saving category…" : "Continue to room"}</Button></DialogFooter>
            </form> : <form onSubmit={(event) => void submitRoom(event)} className="space-y-4">
                <div className="rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm"><span className="font-medium">Category:</span> {categories.find((category) => category.id === categoryId)?.name} · ₦{categories.find((category) => category.id === categoryId)?.pricePerNight.toLocaleString()} / night</div>
                <div className="space-y-1.5"><label htmlFor="room-number" className="text-sm font-medium">Room number</label><input id="room-number" autoFocus required value={number} onChange={(event) => setNumber(event.target.value)} placeholder="e.g. 204" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" /></div>
                <DialogFooter className="-mx-4 -mb-4 mt-6 flex-row justify-between"><Button type="button" variant="outline" onClick={() => setStep("category")}>Back</Button><Button type="submit" disabled={submitting || !categoryId || !number.trim()} className="gap-2 ">{submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}{submitting ? "Creating…" : "Create room"}</Button></DialogFooter>
            </form>}
        </DialogContent></Dialog>;
}


export default RoomCreateDialog;