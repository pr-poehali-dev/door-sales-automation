import json
import os
import base64
import csv
import io
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для массовой загрузки товаров из CSV файла в базу данных
    Args: event - dict с httpMethod, body (base64 encoded CSV)
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict с результатами загрузки
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_str = event.get('body', '')
    is_base64 = event.get('isBase64Encoded', False)
    
    if is_base64:
        body_str = base64.b64decode(body_str).decode('utf-8')
    
    body_data = json.loads(body_str)
    csv_content = body_data.get('csv_content', '')
    
    if not csv_content:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'CSV content is required'}),
            'isBase64Encoded': False
        }
    
    products_to_insert: List[Dict[str, Any]] = []
    csv_file = io.StringIO(csv_content)
    csv_reader = csv.DictReader(csv_file)
    
    for row in csv_reader:
        name = row.get('name', '').strip()
        description = row.get('description', '').strip()
        price = row.get('price', '0').strip()
        category = row.get('category', '').strip()
        image_url = row.get('image_url', '/placeholder.svg').strip()
        stock_quantity = row.get('stock_quantity', '0').strip()
        
        if not name or not price or category not in ['door', 'hardware']:
            continue
        
        products_to_insert.append({
            'name': name,
            'description': description,
            'price': float(price),
            'category': category,
            'image_url': image_url,
            'stock_quantity': int(stock_quantity)
        })
    
    if not products_to_insert:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'No valid products found in CSV'}),
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    inserted_count = 0
    for product in products_to_insert:
        cursor.execute(
            "INSERT INTO products (name, description, price, category, image_url, stock_quantity) VALUES ('" +
            product['name'].replace("'", "''") + "', '" +
            product['description'].replace("'", "''") + "', " +
            str(product['price']) + ", '" +
            product['category'] + "', '" +
            product['image_url'] + "', " +
            str(product['stock_quantity']) + ")"
        )
        inserted_count += 1
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'message': 'Products uploaded successfully',
            'inserted_count': inserted_count
        }),
        'isBase64Encoded': False
    }
