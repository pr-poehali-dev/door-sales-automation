import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const UPLOAD_API_URL = 'https://functions.poehali.dev/4a61d33b-777d-4fc5-a11d-a49b83dbca3e';

export default function Admin() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension === 'csv') {
        setFile(selectedFile);
      } else {
        toast({
          title: 'Ошибка',
          description: 'Поддерживаются только CSV файлы',
          variant: 'destructive'
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'Ошибка',
        description: 'Выберите файл для загрузки',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      const text = await file.text();
      
      const response = await fetch(UPLOAD_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ csv_content: text })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успешно!',
          description: `Загружено товаров: ${data.inserted_count}`
        });
        setFile(null);
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось загрузить товары',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при загрузке',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'name,description,price,category,image_url,stock_quantity\nМежкомнатная дверь Образец,Пример описания товара,15000,door,/placeholder.svg,20\nРучка дверная Образец,Пример фурнитуры,850,hardware,/placeholder.svg,50';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_products.csv';
    link.click();
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Shield" size={32} className="text-primary" />
              <h1 className="text-2xl font-bold">Админ-панель</h1>
            </div>
            <Button variant="outline" onClick={() => navigate('/')}>
              <Icon name="Home" size={18} className="mr-2" />
              На главную
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Upload" size={24} />
                Загрузка товаров
              </CardTitle>
              <CardDescription>
                Загрузите CSV файл с товарами для автоматического добавления в каталог
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Icon name="Info" size={18} />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">Формат CSV файла:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><strong>name</strong> - название товара</li>
                      <li><strong>description</strong> - описание</li>
                      <li><strong>price</strong> - цена (число)</li>
                      <li><strong>category</strong> - категория (door или hardware)</li>
                      <li><strong>image_url</strong> - ссылка на изображение</li>
                      <li><strong>stock_quantity</strong> - количество на складе</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Button variant="outline" onClick={downloadTemplate} className="w-full">
                  <Icon name="Download" size={18} className="mr-2" />
                  Скачать шаблон CSV
                </Button>

                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <Icon name="FileUp" size={48} className="text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {file ? file.name : 'Нажмите для выбора CSV файла'}
                      </p>
                    </div>
                  </label>
                </div>

                <Button 
                  onClick={handleUpload} 
                  disabled={!file || uploading}
                  className="w-full"
                  size="lg"
                >
                  {uploading ? (
                    <>
                      <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Icon name="Upload" size={18} className="mr-2" />
                      Загрузить товары
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
