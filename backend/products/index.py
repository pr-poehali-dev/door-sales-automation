import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для получения списка товаров из базы данных с фильтрацией по категориям
    Args: event - dict с httpMethod, queryStringParameters (category)
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict со списком товаров
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters') or {}
    category_filter = params.get('category', 'all')
    
    database_url = os.environ.get('DATABASE_URL')
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    if category_filter == 'all':
        cursor.execute('SELECT id, name, description, price, category, image_url, stock_quantity FROM products ORDER BY id')
    else:
        cursor.execute(
            "SELECT id, name, description, price, category, image_url, stock_quantity FROM products WHERE category = '" + category_filter + "' ORDER BY id"
        )
    
    products = cursor.fetchall()
    cursor.close()
    conn.close()
    
    products_list = []
    for product in products:
        products_list.append({
            'id': product['id'],
            'name': product['name'],
            'description': product['description'],
            'price': float(product['price']),
            'category': product['category'],
            'image': product['image_url'],
            'stock_quantity': product['stock_quantity']
        })
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'products': products_list}),
        'isBase64Encoded': False
    }
