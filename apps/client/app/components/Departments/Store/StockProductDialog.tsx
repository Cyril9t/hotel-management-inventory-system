import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { createStockProduct, getStockApiMessage, updateStockProduct, type ProductSalesDepartment, type StockProduct } from "~/services/stock";
import type { AxiosInstance } from "axios";

interface StockProductDialogProps {
    api: AxiosInstance;
    open: boolean;
    product: StockProduct | null;
    onOpenChange: (open: boolean) => void;
    onSaved: () => Promise<void>;
}

const inputClass = "mt-1.5";
const fieldLabelClass = "text-sm font-medium text-foreground";

export function StockProductDialog({ api, open, product, onOpenChange, onSaved }: StockProductDialogProps) {
    const [name, setName] = useState("");
    const [department, setDepartment] = useState<ProductSalesDepartment>("BAR");
    const [unitPrice, setUnitPrice] = useState("");
    const [threshold, setThreshold] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        if (!open) return;
        setName(product?.name ?? "");
        setDepartment(product?.department === "RESTAURANT" ? "RESTAURANT" : "BAR");
        setUnitPrice(product?.unitPrice ?? "");
        setThreshold(product ? String(product.lowStockThreshold) : "");
        setFormError("");
    }, [open, product]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError("");
        const parsedPrice = Number(unitPrice);
        const parsedThreshold = threshold.trim() === "" ? undefined : Number(threshold);
        if (!name.trim()) return setFormError("Enter a product name.");
        if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) return setFormError("Unit price must be greater than zero.");
        if (parsedThreshold !== undefined && (!Number.isInteger(parsedThreshold) || parsedThreshold < 0)) {
            return setFormError("Low-stock threshold must be a non-negative whole number.");
        }

        setIsSaving(true);
        try {
            const data = {
                name: name.trim(),
                department,
                unitPrice: parsedPrice,
                ...(parsedThreshold !== undefined && { lowStockThreshold: parsedThreshold }),
            };
            if (product) await updateStockProduct(api, product.id, data);
            else await createStockProduct(api, data);
            toast.success(product ? "Product updated" : "Product created");
            await onSaved();
            onOpenChange(false);
        } catch (error) {
            const message = getStockApiMessage(error, "The product could not be saved. Try again.");
            setFormError(message);
            toast.error(product ? "Could not update product" : "Could not create product", { description: message });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{product ? "Edit product" : "Create product"}</DialogTitle>
                    <DialogDescription>
                        Product department is its sales department. Stock locations are managed separately by inventory balances.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <label className={fieldLabelClass}>
                        Product name
                        <Input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required />
                    </label>

                    <label className={fieldLabelClass}>
                        Sales department
                        <select className={`${inputClass} h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`} value={department} onChange={(event) => setDepartment(event.target.value as ProductSalesDepartment)}>
                            <option value="BAR">Bar</option>
                            <option value="RESTAURANT">Restaurant</option>
                        </select>
                    </label>

                    <label className={fieldLabelClass}>
                        Unit price
                        <Input className={inputClass} type="number" min="0.01" step="0.01" inputMode="decimal" value={unitPrice} onChange={(event) => setUnitPrice(event.target.value)} required />
                    </label>

                    <label className={fieldLabelClass}>
                        Low-stock threshold
                        <Input className={inputClass} type="number" min="0" step="1" inputMode="numeric" value={threshold} onChange={(event) => setThreshold(event.target.value)} placeholder=" Server default: 10" />
                        <span className="mt-1 block text-xs font-normal text-muted-foreground">The  Server evaluates this product threshold against STORE stock.</span>
                    </label>

                    {formError && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{formError}</p>}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
                        <Button type="submit" disabled={isSaving}>{isSaving ? "Saving…" : product ? "Save changes" : "Create product"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
