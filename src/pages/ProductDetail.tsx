import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'https://functions.poehali.dev/ae3e5f1e-4d76-46c1-86e4-3a9b965d7885';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'door' | 'hardware';
  image: string;
  stock_quantity: number;
  created_at?: string;
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_URL}?id=${id}`);
        const data = await response.json();
        
        if (response.ok) {
          setProduct(data.product);
        } else {
          toast({
            title: 'Ошибка',
            description: 'Товар не найден',
            variant: 'destructive'
          });
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить товар',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate, toast]);

  const handleAddToCart = () => {
    toast({
      title: 'Добавлено в корзину',
      description: `${product?.name} (${quantity} шт.)`
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="DoorOpen" size={32} className="text-primary" />
              <h1 className="text-2xl font-bold text-foreground">DoorMaster</h1>
            </div>
            <Button variant="outline" onClick={() => navigate('/')}>
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              Назад в каталог
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-5xl mx-auto overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            <div className="aspect-square bg-secondary/50 rounded-lg overflow-hidden flex items-center justify-center">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-6">
              <div>
                <Badge variant="outline" className="mb-3">
                  {product.category === 'door' ? 'Двери' : 'Фурнитура'}
                </Badge>
                <h2 className="text-4xl font-bold mb-4">{product.name}</h2>
                <p className="text-3xl font-bold text-primary mb-6">
                  {product.price.toLocaleString('ru-RU')} ₽
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Icon name="FileText" size={20} />
                    Описание
                  </h3>
                  <p className="text-muted-foreground">{product.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Icon name="Package" size={20} />
                    Наличие
                  </h3>
                  <p className="text-muted-foreground">
                    {product.stock_quantity > 0 ? (
                      <span className="text-green-600 font-medium">
                        В наличии: {product.stock_quantity} шт.
                      </span>
                    ) : (
                      <span className="text-red-600 font-medium">Нет в наличии</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-4">
                  <span className="font-semibold">Количество:</span>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Icon name="Minus" size={18} />
                    </Button>
                    <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      disabled={quantity >= product.stock_quantity}
                    >
                      <Icon name="Plus" size={18} />
                    </Button>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full text-lg"
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                >
                  <Icon name="ShoppingCart" size={20} className="mr-2" />
                  Добавить в корзину
                </Button>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="Truck" size={16} />
                  <span>Доставка по всей России</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="Shield" size={16} />
                  <span>Гарантия качества</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="Headphones" size={16} />
                  <span>Поддержка 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="max-w-5xl mx-auto mt-8">
          <Card>
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6">Дополнительная информация</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Icon name="Truck" size={18} className="text-primary" />
                    Доставка
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• По Москве — 1-2 дня</li>
                    <li>• По России — 3-7 дней</li>
                    <li>• Бесплатно от 50 000 ₽</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Icon name="CreditCard" size={18} className="text-primary" />
                    Оплата
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Наличными курьеру</li>
                    <li>• Банковской картой</li>
                    <li>• Безналичный расчет</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="bg-foreground text-background py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 DoorMaster. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
