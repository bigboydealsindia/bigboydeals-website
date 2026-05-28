import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Tag, TrendingUp, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/store/useProductStore";
import { Separator } from "@/components/ui/separator";

interface ProductCardProps {
  product: Product;
  brandName: string;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onToggleMostSelling: (id: number, currentStatus: boolean) => void; // NAYA PROP
}

export function ProductCard({
  product,
  brandName,
  onEdit,
  onDelete,
  onToggleMostSelling,
}: ProductCardProps) {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    await onToggleMostSelling(product.id, product.isMostSelling);
    setIsToggling(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-background border border-border rounded-md p-2.5 flex flex-col shadow-sm group hover:border-primary/20 hover:shadow-md transition-all overflow-hidden relative"
    >
      <div className="relative w-full aspect-[4/5] bg-secondary/5 rounded-sm border border-border/50 overflow-hidden flex items-center justify-center p-1.5 mb-2.5">
        <Image
          src={product.mainImage}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* NAYA: TOP RIGHT TOGGLE BUTTON */}
        <div className="absolute top-1.5 right-1.5 z-10">
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold shadow-sm transition-colors border ${
              product.isMostSelling
                ? "bg-yellow-400 text-yellow-900 border-yellow-500 hover:bg-yellow-500"
                : "bg-background/90 backdrop-blur-sm text-muted-foreground border-border/50 hover:text-foreground hover:bg-background"
            }`}
          >
            {isToggling ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <TrendingUp size={12} />
            )}
            {product.isMostSelling ? "Most Selling" : "Set Most Selling"}
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 px-0.5">
        <h4 className="font-semibold text-sm line-clamp-1 mb-1 leading-tight group-hover:text-primary transition-colors">
          {product.name}
        </h4>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-muted-foreground/70">
            <Tag size={10} />
            <span className="text-[10px] font-bold uppercase tracking-tight">
              {brandName}
            </span>
          </div>

          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${product.stock > 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-destructive/10 text-destructive"}`}
          >
            {product.stock > 0 ? `${product.stock} IN STOCK` : "OUT OF STOCK"}
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 mt-auto">
          <span className="text-base font-bold text-foreground">
            ₹{product.sellingPrice}
          </span>
          <span className="text-[10px] font-medium text-muted-foreground line-through">
            ₹{product.actualPrice}
          </span>
        </div>
      </div>

      <Separator className="my-2.5 opacity-60" />

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEdit(product)}
          className="h-8 flex-1 rounded-md text-xs bg-secondary/50 hover:bg-primary/10 hover:text-primary transition-colors border-none"
        >
          <Pencil size={12} className="mr-1.5" /> Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(product.id)}
          className="h-8 flex-1 rounded-md text-xs bg-destructive/5 text-destructive hover:bg-destructive/15 hover:text-destructive transition-colors"
        >
          <Trash2 size={12} className="mr-1.5" /> Delete
        </Button>
      </div>
    </motion.div>
  );
}
