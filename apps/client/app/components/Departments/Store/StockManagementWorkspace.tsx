import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpDown,
  Boxes,
  Package,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { UseMetricCards } from "~/Context/Context";
import { useAuth } from "~/Context/AuthContext";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  acknowledgeKitchenMovement,
  correctStock,
  deactivateStockProduct,
  getStockApiMessage,
  issueStock,
  listStockBalances,
  listStockMovements,
  listStockProducts,
  receiveStock,
  type StockBalance,
  type StockDepartment,
  type StockMovement,
  type StockMovementType,
  type StockProduct,
  stockDepartments,
} from "~/services/stock";
import { StockProductDialog } from "./StockProductDialog";

type Section =
  | "overview"
  | "inventory"
  | "products"
  | "receiving"
  | "distribution"
  | "corrections"
  | "movements";
const labels: Record<StockDepartment, string> = {
  STORE: "Store",
  RECEPTION: "Reception",
  BAR: "Bar",
  RESTAURANT: "Restaurant",
  KITCHEN: "Kitchen",
};
const sectionNames: Record<Section, string> = {
  overview: "Overview",
  inventory: "Inventory",
  products: "Products",
  receiving: "Receive stock",
  distribution: "Distribution",
  corrections: "Corrections",
  movements: "Movement history",
};
const normalizeRole = (role?: string) =>
  (role ?? "").trim().toLowerCase().replace(/[ -]+/g, "_");
const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : "—";

interface StoreStockData {
  products: StockProduct[];
  balances: StockBalance[];
  kitchenIssues: StockMovement[];
  loading: boolean;
  error: string;
  refresh: () => Promise<StockBalance[] | null>;
}

const StoreStockDataContext = createContext<StoreStockData | null>(null);

export function StoreStockDataProvider({ children }: { children: ReactNode }) {
  const { api } = UseMetricCards();
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [balances, setBalances] = useState<StockBalance[]>([]);
  const [kitchenIssues, setKitchenIssues] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async (): Promise<StockBalance[] | null> => {
    setLoading(true);
    setError("");
    try {
      const [nextProducts, nextBalances, nextKitchenIssues] = await Promise.all(
        [
          listStockProducts(api),
          listStockBalances(api),
          listStockMovements(api, {
            department: "KITCHEN",
            movementType: "ISSUE",
          }),
        ],
      );
      setProducts(nextProducts);
      setBalances(nextBalances);
      setKitchenIssues(nextKitchenIssues);
      return nextBalances;
    } catch (reason) {
      setError(
        getStockApiMessage(reason, "Inventory data could not be loaded."),
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <StoreStockDataContext.Provider
      value={{ products, balances, kitchenIssues, loading, error, refresh }}
    >
      {children}
    </StoreStockDataContext.Provider>
  );
}

export function useOptionalStoreStockData() {
  return useContext(StoreStockDataContext);
}

export function StockManagementWorkspace({
  initialSection = "overview",
  showSectionNavigation = true,
}: {
  initialSection?: Section;
  showSectionNavigation?: boolean;
}) {
  const { api } = UseMetricCards();
  const { user } = useAuth();
  const canManage = normalizeRole(user?.role) === "store_manager";
  const stockData = useContext(StoreStockDataContext);
  if (!stockData)
    throw new Error(
      "StockManagementWorkspace must be rendered inside StoreStockDataProvider",
    );
  const [section, setSection] = useState<Section>(initialSection);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [movementLoading, setMovementLoading] = useState(false);
  const [movementError, setMovementError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<
    "ALL" | StockDepartment
  >("ALL");
  const [movementFilter, setMovementFilter] = useState<
    "ALL" | StockMovementType
  >("ALL");
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StockProduct | null>(
    null,
  );
  const [issueOpen, setIssueOpen] = useState(false);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);

  const { products, balances, kitchenIssues, loading, error, refresh } =
    stockData;
  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  // The products endpoint is authoritative. Inactive products are not merged in
  // from balances because that endpoint is not an inactive-product catalogue.
  const allProducts = products;
  const activeProductIds = new Set(allProducts.map((product) => product.id));
  const storeBalances = balances.filter(
    (balance) =>
      balance.department === "STORE" && activeProductIds.has(balance.productId),
  );
  const lowStockRows = storeBalances.filter(
    (balance) => balance.quantity <= balance.product.lowStockThreshold,
  );
  const lowStockCount = lowStockRows.length;
  const pendingKitchen = kitchenIssues.filter(
    (movement) =>
      movement.toDepartment === "KITCHEN" && !movement.acknowledgedAt,
  );
  const visibleInventoryProducts = allProducts.filter(
    (product) =>
      `${product.name} ${labels[product.department]}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (departmentFilter === "ALL" ||
        balances.some(
          (balance) =>
            balance.productId === product.id &&
            balance.department === departmentFilter,
        )),
  );
  const visibleProducts = allProducts.filter((product) =>
    `${product.name} ${product.department}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  const loadMovements = useCallback(async () => {
    setMovementLoading(true);
    setMovementError("");
    try {
      const rows = await listStockMovements(api, {
        ...(departmentFilter !== "ALL" ? { department: departmentFilter } : {}),
        ...(movementFilter !== "ALL" ? { movementType: movementFilter } : {}),
      });
      setMovements(rows);
    } catch (e) {
      const message = getStockApiMessage(e, "Try again shortly.");
      setMovementError(message);
      toast.error("Could not load movement history", { description: message });
    } finally {
      setMovementLoading(false);
    }
  }, [api, departmentFilter, movementFilter]);
  useEffect(() => {
    if (section === "movements") void loadMovements();
  }, [section, loadMovements]);

  async function reloadAfterMutation(message?: string, reloadHistory = true) {
    const updatedBalances = await refresh();
    if (reloadHistory) await loadMovements();
    if (message) toast.success(message);
    return updatedBalances;
  }

  async function handleProductStatus(product: StockProduct) {
    if (!canManage) return;
    setBusyId(product.id);
    try {
      await deactivateStockProduct(api, product.id);
      await reloadAfterMutation("Product deactivated", false);
    } catch (e) {
      toast.error("Product status was not changed", {
        description: getStockApiMessage(e, "Try again shortly."),
      });
    } finally {
      setBusyId("");
    }
  }

  if (loading && !products.length && !balances.length)
    return (
      <div
        className="flex min-h-64 items-center justify-center text-sm text-muted-foreground"
        role="status"
      >
        Loading inventory…
      </div>
    );
  if (error && !products.length && !balances.length)
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
          <Button variant="outline" onClick={() => void refresh()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Inventory workspace
          </h2>
          <p className="text-sm text-muted-foreground">
            Products, stock balances, department distribution and stock
            activity.
          </p>
        </div>
        {canManage && showSectionNavigation && (
          <div className="flex flex-wrap gap-2">
            {canManage && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingProduct(null);
                  setProductDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                New product
              </Button>
            )}
            {canManage && (
              <Button
                variant="outline"
                onClick={() => {
                  setSection("receiving");
                  setReceiveOpen(true);
                }}
              >
                <Truck className="mr-2 h-4 w-4" />
                Receive stock
              </Button>
            )}
            {canManage && (
              <Button onClick={() => setIssueOpen(true)}>
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                Distribute stock
              </Button>
            )}
          </div>
        )}
      </div>
      {showSectionNavigation && (
        <div
          className="flex gap-1 overflow-x-auto border-b border-border pb-1"
          role="tablist"
          aria-label="Inventory sections"
        >
          {(canManage
            ? (Object.keys(sectionNames) as Section[])
            : ([
                "overview",
                "inventory",
                "products",
                "distribution",
                "movements",
              ] as Section[])
          ).map((key) => (
            <button
              key={key}
              role="tab"
              aria-selected={section === key}
              onClick={() => setSection(key)}
              className={`shrink-0 rounded-t-md px-3 py-2 text-sm font-medium transition-colors ${section === key ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
            >
              {sectionNames[key]}
            </button>
          ))}
        </div>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {section === "overview" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              icon={<Package />}
              title="Active products"
              value={products.length}
              hint="Returned by the active product list"
            />
            <Metric
              icon={<Boxes />}
              title="STORE balance records"
              value={storeBalances.length}
              hint="Only products with a stored balance record"
            />
            <Metric
              icon={<SlidersHorizontal />}
              title="Low stock in STORE"
              value={lowStockCount}
              hint="STORE quantity at or below product threshold"
            />
            <Metric
              icon={<ArrowDownToLine />}
              title="Kitchen issues awaiting acknowledgement"
              value={pendingKitchen.length}
              hint="Kitchen receives stock after acknowledgement"
            />
          </div>
          <Card className={lowStockRows.length ? "border border-destructive/30 bg-destructive/5" : undefined}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 text-base ${lowStockRows.length ? "text-destructive" : ""}`}>
                {lowStockRows.length > 0 && <span aria-hidden="true" className="h-2 w-2 rounded-full bg-destructive animate-pulse" />}
                Low stock in STORE
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockRows.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[420px] text-left text-sm">
                    <thead className="text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2">Product</th>
                        <th className="px-3 py-2">STORE quantity</th>
                        <th className="px-3 py-2">Threshold</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {lowStockRows.map((row) => (
                        <tr key={row.id}>
                          <td className="px-3 py-3 font-medium">
                            {row.product.name}
                          </td>
                          <td className="px-3 py-3">{row.quantity}</td>
                          <td className="px-3 py-3">
                            {row.product.lowStockThreshold}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty text="No STORE balance records are currently at or below their product thresholds." />
              )}
            </CardContent>
          </Card>
          <StockNotice />
        </>
      )}
      {section === "inventory" && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">Department balances</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Current quantities are shown by product. A dash means the API
                  has no balance record for that location.
                </p>
              </div>
              <Toolbar query={query} setQuery={setQuery}>
                <select
                  aria-label="Filter department"
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={departmentFilter}
                  onChange={(e) =>
                    setDepartmentFilter(
                      e.target.value as "ALL" | StockDepartment,
                    )
                  }
                >
                  <option value="ALL">All departments</option>
                  {stockDepartments.map((d) => (
                    <option key={d} value={d}>
                      {labels[d]}
                    </option>
                  ))}
                </select>
              </Toolbar>
            </div>
          </CardHeader>
          <CardContent>
            <BalanceTable rows={balances} products={visibleInventoryProducts} />
          </CardContent>
        </Card>
      )}
      {section === "products" && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">Product catalogue</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Product department is for sales. Physical stock is tracked by
                  department balance.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {canManage && (
                  <Button
                    onClick={() => {
                      setEditingProduct(null);
                      setProductDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New product
                  </Button>
                )}
                <Toolbar query={query} setQuery={setQuery} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {canManage && (
              <p className="mb-3 text-xs text-muted-foreground">
                The  Server lists active products only. It supports reactivation
                by product ID but has no inactive-product listing, so
                deactivated products cannot be reliably found here to
                reactivate.
              </p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3">Product</th>
                    <th className="px-3 py-3">Sales department</th>
                    <th className="px-3 py-3">Unit price</th>
                    <th className="px-3 py-3">Low-stock threshold</th>
                    <th className="px-3 py-3">Status</th>
                    {canManage && <th className="px-3 py-3">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visibleProducts.map((p) => (
                    <tr key={p.id}>
                      <td className="px-3 py-3 font-medium">{p.name}</td>
                      <td className="px-3 py-3">
                        {labels[p.department as StockDepartment] ??
                          p.department}
                      </td>
                      <td className="px-3 py-3">{p.unitPrice}</td>
                      <td className="px-3 py-3">{p.lowStockThreshold}</td>
                      <td className="px-3 py-3">
                        <Status active={p.isActive} />
                      </td>
                      {canManage && (
                        <td className="px-3 py-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingProduct(p);
                                setProductDialogOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                            {p.isActive && (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={busyId === p.id}
                                onClick={() => void handleProductStatus(p)}
                              >
                                {busyId === p.id ? "Saving…" : "Deactivate"}
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {visibleProducts.length === 0 && (
                <Empty text="No products match this search." />
              )}
            </div>
          </CardContent>
        </Card>
      )}
      {section === "receiving" && canManage && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">
                  Receive stock into STORE
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Register quantities physically received into central STORE
                  inventory.
                </p>
              </div>
              <Button onClick={() => setReceiveOpen(true)}>
                <Truck className="mr-2 h-4 w-4" />
                Register stock quantity
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <StockNotice />
            <p className="mt-4 text-sm text-muted-foreground">
              Products without a STORE balance record are available in the
              receiving form. The first receipt creates the balance; later
              receipts add to it.
            </p>
          </CardContent>
        </Card>
      )}
      {section === "distribution" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">
                  Department distribution
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Review actual balances by department and, as Store Manager,
                  issue stock from STORE.
                </p>
              </div>
              {canManage && (
                <Button onClick={() => setIssueOpen(true)}>
                  <ArrowLeftRight className="mr-2 h-4 w-4" />
                  Issue stock
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <BalanceTable rows={balances} products={allProducts} />
            {canManage && (
              <div className="mt-4 flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">
                    Review recorded stock operations
                  </p>
                  <p className="text-sm text-muted-foreground">
                    See source, destination, actor and Kitchen acknowledgement
                    details in movement history.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSection("movements")}
                >
                  View movement history
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {section === "corrections" && canManage && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">Stock corrections</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Record a documented count adjustment for a department balance.
                </p>
              </div>
              <Button onClick={() => setCorrectionOpen(true)}>
                <ArrowUpDown className="mr-2 h-4 w-4" />
                New correction
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Corrections change the selected department balance and create a
              movement record.
            </p>
          </CardContent>
        </Card>
      )}
      {section === "movements" && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <CardTitle className="text-base">
                  Stock movement history
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Recorded stock operations returned by the  Server.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Toolbar query={query} setQuery={setQuery} />
                <select
                  aria-label="Movement department"
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={departmentFilter}
                  onChange={(e) =>
                    setDepartmentFilter(
                      e.target.value as "ALL" | StockDepartment,
                    )
                  }
                >
                  <option value="ALL">All departments</option>
                  {stockDepartments.map((d) => (
                    <option key={d} value={d}>
                      {labels[d]}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Movement type"
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={movementFilter}
                  onChange={(e) =>
                    setMovementFilter(
                      e.target.value as "ALL" | StockMovementType,
                    )
                  }
                >
                  <option value="ALL">All types</option>
                  {(
                    [
                      "RECEIVE",
                      "ISSUE",
                      "SALE_DEDUCTION",
                      "CORRECTION",
                    ] as StockMovementType[]
                  ).map((type) => (
                    <option key={type} value={type}>
                      {type.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {movementLoading && (
              <p role="status" className="mb-3 text-sm text-muted-foreground">
                Loading stock movements…
              </p>
            )}
            {movementError && (
              <p role="alert" className="mb-3 text-sm text-destructive">
                {movementError}
              </p>
            )}
            <MovementTable
              rows={movements.filter((m) =>
                `${m.product?.name ?? ""} ${m.actor?.firstName ?? ""} ${m.actor?.lastName ?? ""} ${m.movementType}`
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              )}
            />
          </CardContent>
        </Card>
      )}
      {canManage && (
        <StockProductDialog
          api={api}
          open={productDialogOpen}
          product={editingProduct}
          onOpenChange={setProductDialogOpen}
          onSaved={async () => {
            await refresh();
          }}
        />
      )}
      {canManage && (
        <ReceiveDialog
          open={receiveOpen}
          onOpenChange={setReceiveOpen}
          products={allProducts.filter((p) => p.isActive)}
          balances={balances}
          api={api}
          onSaved={async (productId, quantity) => {
            const updatedBalances = await reloadAfterMutation(undefined, true);
            const currentQuantity = updatedBalances?.find(
              (balance) =>
                balance.productId === productId &&
                balance.department === "STORE",
            )?.quantity;
            toast.success(`Received ${quantity} into STORE`, {
              description:
                currentQuantity === undefined
                  ? "Receipt recorded. The current balance could not be refreshed."
                  : `Updated STORE quantity: ${currentQuantity}`,
            });
            return currentQuantity;
          }}
        />
      )}
      {canManage && (
        <IssueDialog
          open={issueOpen}
          onOpenChange={setIssueOpen}
          products={allProducts.filter((p) => p.isActive)}
          balances={balances}
          api={api}
          onSaved={async () => {
            await reloadAfterMutation("Stock issued successfully");
          }}
        />
      )}
      {canManage && (
        <CorrectionDialog
          open={correctionOpen}
          onOpenChange={setCorrectionOpen}
          products={allProducts.filter((p) => p.isActive)}
          balances={balances}
          api={api}
          onSaved={async () => {
            await reloadAfterMutation("Stock correction recorded");
          }}
        />
      )}
      {canManage && section === "distribution" && (
        <KitchenAcknowledgements
          rows={pendingKitchen}
          allowed
          busyId={busyId}
          setBusyId={setBusyId}
          api={api}
          onSaved={async () => {
            await reloadAfterMutation("Kitchen receipt acknowledged");
          }}
        />
      )}
    </div>
  );
}

function Metric({
  icon,
  title,
  value,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  hint: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <span className="rounded-lg bg-primary/10 p-2 text-primary">
          {icon}
        </span>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}
function StockNotice() {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
      <p className="font-semibold">Receipts are recorded directly into STORE</p>
      <p className="mt-1 text-muted-foreground">
        Each receive operation creates or increments the STORE balance and
        records a RECEIVE movement. It does not represent a transfer from a
        separate Management stock location.
      </p>
    </div>
  );
}
function Toolbar({
  query,
  setQuery,
  children,
}: {
  query: string;
  setQuery: (value: string) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-48">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {children}
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="py-10 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
function Status({ active }: { active: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs ${active ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}
function BalanceTable({
  rows,
  products,
}: {
  rows: StockBalance[];
  products: StockProduct[];
}) {
  const quantityFor = (productId: string, department: StockDepartment) =>
    rows.find(
      (row) => row.productId === productId && row.department === department,
    )?.quantity;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[880px] text-left text-sm">
        <thead className="text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-3 py-3">Item</th>
            <th className="px-3 py-3">Department</th>
            <th className="px-3 py-3">Main Store</th>
            <th className="px-3 py-3">Available in Department</th>
            <th className="px-3 py-3">Reorder At</th>
            <th className="px-3 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {products.map((product) => {
            const storeQuantity = quantityFor(product.id, "STORE");
            const departmentQuantity = quantityFor(
              product.id,
              product.department,
            );
            const storeLow =
              storeQuantity !== undefined &&
              storeQuantity <= product.lowStockThreshold;
            const departmentLow =
              departmentQuantity !== undefined &&
              departmentQuantity <= product.lowStockThreshold;
            return (
              <tr key={product.id}>
                <td className="px-3 py-3 font-medium">{product.name}</td>
                <td className="px-3 py-3">{labels[product.department]}</td>
                <td className="px-3 py-3 tabular-nums">
                  {storeQuantity ?? (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-3 py-3 tabular-nums">
                  {departmentQuantity ?? (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-3 py-3 tabular-nums">
                  {product.lowStockThreshold}
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {storeLow && <span className="inline-flex rounded-md border border-destructive/20 bg-destructive/5 px-2 py-0.5 text-xs font-medium text-destructive">Low in Store</span>}
                    {departmentLow && <span className="inline-flex rounded-md border border-destructive/20 bg-destructive/5 px-2 py-0.5 text-xs font-medium text-destructive">Issue to {labels[product.department]}</span>}
                    {!storeLow && !departmentLow && departmentQuantity === undefined && <span className="text-muted-foreground">No balance</span>}
                    {!storeLow && !departmentLow && departmentQuantity !== undefined && <span className="text-muted-foreground">In stock</span>}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {products.length === 0 && (
        <Empty text="No inventory records match this search or department filter." />
      )}
    </div>
  );
}
function MovementTable({ rows }: { rows: StockMovement[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-3 py-3">Product / type</th>
            <th className="px-3 py-3">Quantity</th>
            <th className="px-3 py-3">Direction</th>
            <th className="px-3 py-3">Performed by</th>
            <th className="px-3 py-3">Time / acknowledgement</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((m) => (
            <tr key={m.id}>
              <td className="px-3 py-3">
                <p className="font-medium">{m.product?.name ?? "Product"}</p>
                <p className="text-xs text-muted-foreground">
                  {m.movementType.replaceAll("_", " ")}
                  {m.correctionReason ? ` · ${m.correctionReason}` : ""}
                </p>
              </td>
              <td className="px-3 py-3 tabular-nums">{m.quantity}</td>
              <td className="px-3 py-3">
                {m.fromDepartment ? labels[m.fromDepartment] : "—"} →{" "}
                {m.toDepartment ? labels[m.toDepartment] : "—"}
              </td>
              <td className="px-3 py-3">
                {[m.actor?.firstName, m.actor?.lastName]
                  .filter(Boolean)
                  .join(" ") ||
                  m.actor?.email ||
                  "—"}
              </td>
              <td className="px-3 py-3">
                <p>{formatDate(m.createdAt)}</p>
                {m.acknowledgedAt && (
                  <>
                    <p className="text-xs text-muted-foreground">
                      Acknowledged {m.acknowledgedQuantity ?? "—"} of{" "}
                      {m.quantity} at {formatDate(m.acknowledgedAt)}
                    </p>
                    {m.acknowledgedQuantity !== null &&
                      m.acknowledgedQuantity !== m.quantity && (
                        <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                          Discrepancy recorded
                        </p>
                      )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <Empty text="No stock movements match these filters." />
      )}
    </div>
  );
}

function ReceiveDialog({
  open,
  onOpenChange,
  products,
  balances,
  api,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: StockProduct[];
  balances: StockBalance[];
  api: ReturnType<typeof UseMetricCards>["api"];
  onSaved: (productId: string, quantity: number) => Promise<number | undefined>;
}) {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const selectedProduct = products.find((product) => product.id === productId);
  const existingBalance = balances.find(
    (balance) =>
      balance.productId === productId && balance.department === "STORE",
  );
  useEffect(() => {
    if (open) {
      setProductId("");
      setQuantity("");
      setError("");
    }
  }, [open]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(quantity);
    if (!productId) return setError("Select a product.");
    if (!Number.isInteger(amount) || amount <= 0)
      return setError("Quantity must be a positive whole number.");
    setBusy(true);
    setError("");
    try {
      await receiveStock(api, { productId, quantity: amount });
      await onSaved(productId, amount);
      onOpenChange(false);
    } catch (e) {
      const message = getStockApiMessage(e, "Stock could not be received.");
      setError(message);
      toast.error("Stock receipt failed", { description: message });
    } finally {
      setBusy(false);
    }
  }
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Receive stock into STORE"
      description="Record the actual quantity received. This adds to the existing STORE balance or creates its first balance record."
    >
      <form onSubmit={submit} className="space-y-4">
        <SelectField label="Product" value={productId} setValue={setProductId}>
          <option value="">Choose a product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ·{" "}
              {labels[p.department as StockDepartment] ?? p.department}
            </option>
          ))}
        </SelectField>
        {selectedProduct && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
            <p className="font-medium">{selectedProduct.name}</p>
            <p className="mt-1 text-muted-foreground">
              Current STORE quantity:{" "}
              {existingBalance
                ? existingBalance.quantity
                : "No balance record yet; this receipt creates the first balance."}
            </p>
          </div>
        )}
        <Field
          label="Quantity received"
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={setQuantity}
        />
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <FormActions
          onCancel={() => onOpenChange(false)}
          busy={busy}
          label="Receive stock"
        />
      </form>
    </FormDialog>
  );
}

function IssueDialog({
  open,
  onOpenChange,
  products,
  balances,
  api,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: StockProduct[];
  balances: StockBalance[];
  api: ReturnType<typeof UseMetricCards>["api"];
  onSaved: () => Promise<void>;
}) {
  const [productId, setProductId] = useState("");
  const [to, setTo] = useState<Exclude<StockDepartment, "STORE">>("BAR");
  const [quantity, setQuantity] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const available = balances.find(
    (b) => b.productId === productId && b.department === "STORE",
  )?.quantity;
  useEffect(() => {
    if (open) {
      setProductId("");
      setTo("BAR");
      setQuantity("");
      setError("");
    }
  }, [open]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const qty = Number(quantity);
    if (!productId) return setError("Select a product.");
    if (!Number.isInteger(qty) || qty <= 0)
      return setError("Quantity must be a positive whole number.");
    if (available === undefined || qty > available)
      return setError("Quantity exceeds the available STORE balance.");
    setBusy(true);
    setError("");
    try {
      await issueStock(api, {
        productId,
        fromDepartment: "STORE",
        toDepartment: to,
        quantity: qty,
      });
      await onSaved();
      onOpenChange(false);
    } catch (e) {
      const message = getStockApiMessage(e, "Stock could not be issued.");
      setError(message);
      toast.error("Stock issue failed", { description: message });
    } finally {
      setBusy(false);
    }
  }
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Distribute stock"
      description="Issue available stock from STORE to a hotel department."
    >
      <form onSubmit={submit} className="space-y-4">
        <SelectField label="Product" value={productId} setValue={setProductId}>
          <option value="">Choose a product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Destination department"
          value={to}
          setValue={(v) => setTo(v as Exclude<StockDepartment, "STORE">)}
        >
          {stockDepartments
            .filter(
              (d): d is Exclude<StockDepartment, "STORE"> => d !== "STORE",
            )
            .map((d) => (
              <option key={d} value={d}>
                {labels[d]}
              </option>
            ))}
        </SelectField>
        <p className="text-xs text-muted-foreground">
          Available in STORE: {available ?? "No balance record"}
        </p>
        <Field
          label="Quantity"
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={setQuantity}
        />
        {to === "KITCHEN" && (
          <p className="rounded-md bg-muted p-3 text-sm">
            STORE is deducted when issued. Kitchen stock is credited only after
            the Kitchen receipt acknowledgement.
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <FormActions
          onCancel={() => onOpenChange(false)}
          busy={busy}
          label="Issue stock"
        />
      </form>
    </FormDialog>
  );
}

function CorrectionDialog({
  open,
  onOpenChange,
  products,
  balances,
  api,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: StockProduct[];
  balances: StockBalance[];
  api: ReturnType<typeof UseMetricCards>["api"];
  onSaved: () => Promise<void>;
}) {
  const [productId, setProductId] = useState("");
  const [department, setDepartment] = useState<StockDepartment>("STORE");
  const [adjustment, setAdjustment] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const balance = balances.find(
    (b) => b.productId === productId && b.department === department,
  )?.quantity;
  useEffect(() => {
    if (open) {
      setProductId("");
      setDepartment("STORE");
      setAdjustment("");
      setReason("");
      setError("");
    }
  }, [open]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(adjustment);
    if (!productId) return setError("Select a product.");
    if (!Number.isInteger(n) || n === 0)
      return setError("Adjustment must be a nonzero whole number.");
    if (!reason.trim()) return setError("Enter a correction reason.");
    if (n < 0 && (balance === undefined || Math.abs(n) > balance))
      return setError(
        "A negative correction cannot exceed the recorded balance.",
      );
    setBusy(true);
    setError("");
    try {
      await correctStock(api, {
        productId,
        department,
        adjustment: n,
        correctionReason: reason.trim(),
      });
      await onSaved();
      onOpenChange(false);
    } catch (e) {
      const message = getStockApiMessage(
        e,
        "The correction could not be recorded.",
      );
      setError(message);
      toast.error("Correction failed", { description: message });
    } finally {
      setBusy(false);
    }
  }
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Correct stock"
      description="Record a positive or negative stock adjustment with a reason."
    >
      <form onSubmit={submit} className="space-y-4">
        <SelectField label="Product" value={productId} setValue={setProductId}>
          <option value="">Choose a product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Department"
          value={department}
          setValue={(v) => setDepartment(v as StockDepartment)}
        >
          {stockDepartments.map((d) => (
            <option key={d} value={d}>
              {labels[d]}
            </option>
          ))}
        </SelectField>
        <p className="text-xs text-muted-foreground">
          Recorded balance: {balance ?? "No balance record"}
        </p>
        <Field
          label="Adjustment (positive or negative whole number)"
          type="number"
          step="1"
          value={adjustment}
          onChange={setAdjustment}
        />
        <label className="block text-sm font-medium">
          Correction reason
          <textarea
            className="mt-1.5 min-h-20 w-full rounded-md border border-input bg-background p-3 text-sm"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <FormActions
          onCancel={() => onOpenChange(false)}
          busy={busy}
          label="Record correction"
        />
      </form>
    </FormDialog>
  );
}

function KitchenAcknowledgements({
  rows,
  allowed,
  busyId,
  setBusyId,
  api,
  onSaved,
}: {
  rows: StockMovement[];
  allowed: boolean;
  busyId: string;
  setBusyId: (id: string) => void;
  api: ReturnType<typeof UseMetricCards>["api"];
  onSaved: () => Promise<void>;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  async function acknowledge(row: StockMovement) {
    const quantity = Number(values[row.id] ?? row.quantity);
    if (
      !Number.isInteger(quantity) ||
      quantity < 0 ||
      quantity > row.quantity
    ) {
      toast.error(
        `Acknowledged quantity must be between 0 and ${row.quantity}.`,
      );
      return;
    }
    setBusyId(row.id);
    try {
      await acknowledgeKitchenMovement(api, row.id, quantity);
      await onSaved();
    } catch (e) {
      toast.error("Kitchen acknowledgement failed", {
        description: getStockApiMessage(e, "Try again shortly."),
      });
    } finally {
      setBusyId("");
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Kitchen issues awaiting receipt
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No Kitchen issues are awaiting acknowledgement.
          </p>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">
                    {row.product?.name ?? "Product"} · {row.quantity} issued
                  </p>
                  <p className="text-xs text-muted-foreground">
                    From {row.fromDepartment ? labels[row.fromDepartment] : "—"}{" "}
                    · {formatDate(row.createdAt)}
                  </p>
                </div>
                {allowed ? (
                  <div className="flex items-center gap-2">
                    <Input
                      aria-label="Quantity received"
                      className="w-28"
                      type="number"
                      min="0"
                      max={row.quantity}
                      step="1"
                      value={values[row.id] ?? row.quantity}
                      onChange={(e) =>
                        setValues((old) => ({
                          ...old,
                          [row.id]: e.target.value,
                        }))
                      }
                    />
                    <Button
                      disabled={busyId === row.id}
                      onClick={() => void acknowledge(row)}
                    >
                      {busyId === row.id ? "Saving…" : "Acknowledge"}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Your role cannot acknowledge Kitchen receipt.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
function SelectField({
  label,
  value,
  setValue,
  children,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <select
        className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      >
        {children}
      </select>
    </label>
  );
}
function Field({
  label,
  type,
  min,
  step,
  value,
  onChange,
}: {
  label: string;
  type: string;
  min?: string;
  step?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <Input
        className="mt-1.5"
        type={type}
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </label>
  );
}
function FormActions({
  onCancel,
  busy,
  label,
}: {
  onCancel: () => void;
  busy: boolean;
  label: string;
}) {
  return (
    <DialogFooter>
      <Button
        type="button"
        variant="outline"
        disabled={busy}
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={busy}>
        {busy ? "Submitting…" : label}
      </Button>
    </DialogFooter>
  );
}
