import { Link } from 'react-router-dom';
import { Product } from '../../lib/supabase';
import { useCart } from '../../contexts/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);
    try {
      await addToCart(product, 1);
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const imageUrl = Array.isArray(product.images) && product.images.length > 0 
    ? product.images[0] 
    : 'https://readdy.ai/api/search-image?query=product%20placeholder%20image%20on%20clean%20white%20minimalist%20background&width=400&height=400&seq=placeholder&orientation=squarish';

  return (
    <Link 
      to={`/produto/${product.slug}`}
      className="group bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
      data-product-shop
    >
      {/* Imagem */}
      <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
        />
        {product.stock < 10 && product.stock > 0 && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-black text-xs font-semibold rounded">
            Últimas unidades
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded">
            Esgotado
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-yellow-600 dark:group-hover:text-yellow-500 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
          {product.short_description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ou 12x de R$ {(product.price / 12).toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>

        {/* Botão Adicionar */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || isAdding}
          className="w-full mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-black dark:disabled:text-gray-500 font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:cursor-not-allowed"
        >
          {isAdding ? (
            <span className="flex items-center justify-center">
              <i className="ri-loader-4-line animate-spin mr-2"></i>
              Adicionando...
            </span>
          ) : product.stock === 0 ? (
            'Esgotado'
          ) : (
            <span className="flex items-center justify-center">
              <i className="ri-shopping-cart-line mr-2"></i>
              Adicionar ao Carrinho
            </span>
          )}
        </button>
      </div>
    </Link>
  );
}
