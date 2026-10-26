"use client";

import * as React from "react";
import { Boxes, Plus, AlertTriangle, ArrowDownUp, CheckCircle2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

export default function EstoquePage() {
  const { showToast } = useToast();
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Modal Novo Produto
  const [modalNewOpen, setModalNewOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [sku, setSku] = React.useState("");
  const [category, setCategory] = React.useState("HIGIENE");
  const [costPrice, setCostPrice] = React.useState(5000);
  const [salePrice, setSalePrice] = React.useState(9000);
  const [stockQuantity, setStockQuantity] = React.useState(10);
  const [minStockAlert, setMinStockAlert] = React.useState(3);
  const [unit, setUnit] = React.useState("UN");
  const [supplier, setSupplier] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  // Modal Ajuste de Estoque
  const [modalAdjustOpen, setModalAdjustOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [adjustType, setAdjustType] = React.useState<"ENTRADA" | "SAIDA" | "AJUSTE">("ENTRADA");
  const [adjustQty, setAdjustQty] = React.useState(5);
  const [adjustReason, setAdjustReason] = React.useState("Reposição de mercadoria");
  const [adjusting, setAdjusting] = React.useState(false);

  const loadProducts = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          sku: sku || undefined,
          category,
          costPrice: Number(costPrice),
          salePrice: Number(salePrice),
          stockQuantity: Number(stockQuantity),
          minStockAlert: Number(minStockAlert),
          unit,
          supplier,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar produto");

      showToast({
        title: "Produto Cadastrado!",
        description: `${name} foi adicionado ao inventário.`,
        type: "success",
      });

      setModalNewOpen(false);
      setName("");
      setSku("");
      loadProducts();
    } catch (err: any) {
      showToast({ title: "Erro", description: err.message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setAdjusting(true);

    try {
      const res = await fetch("/api/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          type: adjustType,
          quantity: Number(adjustQty),
          reason: adjustReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao movimentar estoque");

      showToast({
        title: "Estoque Atualizado!",
        description: `Movimentação registrada com sucesso.`,
        type: "success",
      });

      setModalAdjustOpen(false);
      loadProducts();
    } catch (err: any) {
      showToast({ title: "Erro", description: err.message, type: "error" });
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Produtos & Controle de Estoque
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestão de cosméticos, rações, medicamentos e movimentações auditadas
          </p>
        </div>

        <Button
          onClick={() => setModalNewOpen(true)}
          size="sm"
          className="gap-1.5 font-bold shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" /> Novo Produto
        </Button>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Carregando inventário...
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Nenhum produto cadastrado no momento.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Custo</TableHead>
                  <TableHead>Venda</TableHead>
                  <TableHead>Saldo em Estoque</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => {
                  const isLow = p.stockQuantity <= p.minStockAlert;
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{p.name}</p>
                          {p.supplier && (
                            <p className="text-[10px] text-slate-400">Fornecedor: {p.supplier}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">{p.category}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 font-mono">
                        {p.sku || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {formatCurrency(p.costPrice)}
                      </TableCell>
                      <TableCell className="text-xs font-black text-slate-900">
                        {formatCurrency(p.salePrice)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isLow ? "text-amber-600" : "text-slate-800"}`}>
                            {p.stockQuantity} {p.unit}
                          </span>
                          {isLow && (
                            <Badge variant="warning" className="text-[9px] gap-1">
                              <AlertTriangle className="w-2.5 h-2.5" /> Baixo (Mín: {p.minStockAlert})
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProduct(p);
                            setAdjustQty(5);
                            setModalAdjustOpen(true);
                          }}
                          className="h-7 text-xs font-semibold gap-1"
                        >
                          <ArrowDownUp className="w-3 h-3 text-slate-500" /> Movimentar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal: Novo Produto */}
      <Dialog open={modalNewOpen} onOpenChange={setModalNewOpen}>
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Produto</DialogTitle>
          <DialogDescription>
            Adicione insumos de banho & tosa ou produtos de balcão.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateProduct} className="space-y-3 pt-2">
          <Input
            label="Nome do Produto"
            placeholder="Ex: Shampoo Neutro 5L, Coleira Antipulgas..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="SKU / Código de Barras"
              placeholder="Ex: SHAMP-01"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 font-medium"
              >
                <option value="HIGIENE">Higiene & Cosméticos</option>
                <option value="ALIMENTO">Alimento & Petiscos</option>
                <option value="FARMACIA">Farmácia & Cuidados</option>
                <option value="ACESSORIOS">Acessórios</option>
                <option value="GERAL">Geral</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Preço de Custo (Centavos)"
              type="number"
              placeholder="5000 para R$ 50"
              value={costPrice}
              onChange={(e) => setCostPrice(Number(e.target.value))}
              required
            />
            <Input
              label="Preço de Venda (Centavos)"
              type="number"
              placeholder="9000 para R$ 90"
              value={salePrice}
              onChange={(e) => setSalePrice(Number(e.target.value))}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Estoque Inicial"
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(Number(e.target.value))}
              required
            />
            <Input
              label="Alerta Estoque Mínimo"
              type="number"
              value={minStockAlert}
              onChange={(e) => setMinStockAlert(Number(e.target.value))}
              required
            />
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Unidade</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 font-medium"
              >
                <option value="UN">Unidade (UN)</option>
                <option value="KG">Quilo (KG)</option>
                <option value="L">Litro (L)</option>
                <option value="PCT">Pacote (PCT)</option>
              </select>
            </div>
          </div>

          <Input
            label="Fornecedor (opcional)"
            placeholder="Ex: Distribuidora Pet Brasil"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalNewOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="font-bold shadow-md shadow-emerald-500/20"
              disabled={submitting}
            >
              {submitting ? "Cadastrando..." : "Salvar Produto"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Modal: Movimentação de Estoque */}
      <Dialog open={modalAdjustOpen} onOpenChange={setModalAdjustOpen}>
        {selectedProduct && (
          <form onSubmit={handleAdjustStock} className="space-y-3">
            <DialogHeader>
              <DialogTitle>Movimentar Estoque</DialogTitle>
              <DialogDescription>
                {selectedProduct.name} • Saldo atual: <span className="font-bold text-slate-800">{selectedProduct.stockQuantity} {selectedProduct.unit}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Tipo de Movimentação</label>
              <select
                value={adjustType}
                onChange={(e: any) => setAdjustType(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 font-medium"
              >
                <option value="ENTRADA">Entrada (Compra / Chegada de mercadoria)</option>
                <option value="SAIDA">Saída (Consumo interno / Descarte)</option>
                <option value="AJUSTE">Ajuste de Balanço (Contagem física exata)</option>
              </select>
            </div>

            <Input
              label={adjustType === "AJUSTE" ? "Novo Saldo Absoluto" : "Quantidade a Movimentar"}
              type="number"
              min="1"
              value={adjustQty}
              onChange={(e) => setAdjustQty(Number(e.target.value))}
              required
            />

            <Input
              label="Motivo / Justificativa"
              placeholder="Ex: Nota fiscal 8192, Frasco danificado..."
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              required
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalAdjustOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="font-bold" disabled={adjusting}>
                {adjusting ? "Atualizando..." : "Registrar Movimentação"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </Dialog>
    </div>
  );
}
