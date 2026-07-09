import { useEffect, useState, useCallback } from "react";
import ProductCard from "../components/ProductCard.jsx";

// Skeleton card for loading state
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="skeleton aspect-[4/3] w-full" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/3 rounded" />
      </div>
    </div>
  );
}

function ProductList() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASEURL =
    import.meta.env.VITE_BASE_URL ||
    import.meta.env.VITE_DJANGO_BASE_URL ||
    "http://127.0.0.1:8000";

  const fetchProducts = useCallback(async (query) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${BASEURL}/api/products/?search=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products. Please try again.");
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [BASEURL]);

  useEffect(() => {
    fetchProducts(searchQuery);
  }, [searchQuery, fetchProducts]);

  const handleSearch = () => {
    setSearchQuery(search.trim());
  };

  const handleClearSearch = () => {
    setSearch("");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero / Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">
            Discover Products
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Find everything you need at amazing prices
          </p>

          {/* Search Bar */}
          <div className="flex gap-2 max-w-xl">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm transition-shadow"
                aria-label="Search products"
              />
              {search && (
                <button
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
            >
              Search
            </button>
          </div>

          {/* Active search label */}
          {searchQuery && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Results for: <span className="font-semibold text-gray-800">"{searchQuery}"</span>
              </span>
              <button
                onClick={handleClearSearch}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3 text-red-700">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-sm">Error loading products</p>
              <p className="text-xs text-red-600">{error}</p>
            </div>
            <button
              onClick={() => fetchProducts(searchQuery)}
              className="ml-auto text-sm font-medium text-red-700 hover:text-red-900 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <>
            {products.length > 0 ? (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Showing <span className="font-semibold text-gray-800">{products.length}</span> product{products.length !== 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-fade-in">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="text-center py-20 px-4 animate-fade-in">
                <div className="text-6xl mb-4 select-none">🔍</div>
                <h2 className="text-xl font-bold text-gray-700 mb-2">No products found</h2>
                <p className="text-gray-500 text-sm mb-6">
                  {searchQuery
                    ? `We couldn't find anything matching "${searchQuery}". Try a different keyword.`
                    : "No products are available at the moment. Check back later!"}
                </p>
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
                  >
                    View All Products
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ProductList;