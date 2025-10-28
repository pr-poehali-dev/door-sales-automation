import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Icon from '@/components/ui/icon';

type Product = {
  id: number;
  name: string;
  price: number;
  category: 'door' | 'hardware';
  image: string;
  description: string;
  stock_quantity?: number;
};

const API_URL = 'https://functions.poehali.dev/d28b6764-0439-489b-88d9-4e922523d72c';

type CartItem = Product & { quantity: number };

export default function Index() {
  const [filter, setFilter] = useState<'all' | 'door' | 'hardware'>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = filter === 'all' ? API_URL : `${API_URL}?category=${filter}`;
        const response = await fetch(url);
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filter]);

  const filteredProducts = products;

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
      );
      return updated.filter(item => item.quantity > 0);
    });
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="DoorOpen" size={32} className="text-primary" />
              <h1 className="text-2xl font-bold text-foreground">DoorMaster</h1>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Главная</a>
              <a href="#catalog" className="text-sm font-medium hover:text-primary transition-colors">Каталог</a>
              <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">О компании</a>
              <a href="#delivery" className="text-sm font-medium hover:text-primary transition-colors">Доставка</a>
              <a href="#contacts" className="text-sm font-medium hover:text-primary transition-colors">Контакты</a>
              <a href="/admin" className="text-sm font-medium hover:text-primary transition-colors">
                <Icon name="Shield" size={16} className="inline mr-1" />
                Админ
              </a>
            </nav>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Icon name="ShoppingCart" size={20} />
                  {totalItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                  <SheetTitle>Корзина</SheetTitle>
                </SheetHeader>
                <div className="mt-8 space-y-4">
                  {cart.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Корзина пуста</p>
                  ) : (
                    <>
                      {cart.map(item => (
                        <div key={item.id} className="flex items-center gap-4 pb-4 border-b">
                          <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.price.toLocaleString('ru-RU')} ₽</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.id, -1)}>
                              <Icon name="Minus" size={14} />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.id, 1)}>
                              <Icon name="Plus" size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-semibold">Итого:</span>
                          <span className="text-2xl font-bold text-primary">{totalPrice.toLocaleString('ru-RU')} ₽</span>
                        </div>
                        <Button className="w-full" size="lg">
                          Оформить заказ
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h2 className="text-5xl font-bold mb-6 text-foreground">Двери и фурнитура для вашего дома</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Широкий ассортимент качественных дверей и комплектующих с доставкой по всей России
            </p>
            <Button size="lg" className="text-lg px-8">
              Смотреть каталог
              <Icon name="ArrowRight" size={20} className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      <section id="catalog" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Каталог товаров</h2>
            <p className="text-muted-foreground">Выберите категорию для просмотра</p>
          </div>

          <div className="flex justify-center gap-4 mb-12">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              Все товары
            </Button>
            <Button 
              variant={filter === 'door' ? 'default' : 'outline'}
              onClick={() => setFilter('door')}
            >
              <Icon name="DoorOpen" size={18} className="mr-2" />
              Двери
            </Button>
            <Button 
              variant={filter === 'hardware' ? 'default' : 'outline'}
              onClick={() => setFilter('hardware')}
            >
              <Icon name="Settings" size={18} className="mr-2" />
              Фурнитура
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">Загрузка товаров...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">Товары не найдены</p>
              </div>
            ) : filteredProducts.map((product, index) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="aspect-square bg-secondary/50 flex items-center justify-center">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <CardContent className="p-6">
                  <Badge variant="outline" className="mb-3">
                    {product.category === 'door' ? 'Двери' : 'Фурнитура'}
                  </Badge>
                  <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{product.description}</p>
                  <p className="text-2xl font-bold text-primary">{product.price.toLocaleString('ru-RU')} ₽</p>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button className="w-full" onClick={() => addToCart(product)}>
                    <Icon name="ShoppingCart" size={18} className="mr-2" />
                    В корзину
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">О компании</h2>
            <p className="text-lg text-muted-foreground mb-6">
              DoorMaster — надежный партнер в мире дверей и фурнитуры. Мы работаем на рынке более 15 лет и предлагаем только проверенные решения для вашего дома.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Award" size={32} className="text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Качество</h3>
                <p className="text-sm text-muted-foreground">Только сертифицированная продукция</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Truck" size={32} className="text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Доставка</h3>
                <p className="text-sm text-muted-foreground">По всей России в срок</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Headphones" size={32} className="text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Поддержка</h3>
                <p className="text-sm text-muted-foreground">Консультации 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="delivery" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6 text-center">Доставка и оплата</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <Icon name="Truck" size={32} className="text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Доставка</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• По Москве — 1-2 дня</li>
                    <li>• По России — 3-7 дней</li>
                    <li>• Бесплатно от 50 000 ₽</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Icon name="CreditCard" size={32} className="text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Оплата</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Наличными курьеру</li>
                    <li>• Банковской картой</li>
                    <li>• Безналичный расчет</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="contacts" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Контакты</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <Icon name="Phone" size={32} className="text-primary mx-auto mb-3" />
                <p className="font-semibold mb-1">Телефон</p>
                <p className="text-muted-foreground">+7 (913) 521-34-79</p>
              </div>
              <div>
                <Icon name="Mail" size={32} className="text-primary mx-auto mb-3" />
                <p className="font-semibold mb-1">Email</p>
                <p className="text-muted-foreground">+79135213479</p>
              </div>
              <div>
                <Icon name="MapPin" size={32} className="text-primary mx-auto mb-3" />
                <p className="font-semibold mb-1">Адрес</p>
                <p className="text-muted-foreground">Москва, ул. Примерная, 123</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-foreground text-background py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 DoorMaster. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}