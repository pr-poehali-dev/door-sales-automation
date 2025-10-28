import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для получения детальной информации о товаре по ID
    Args: event - dict с httpMethod, pathParams (id)
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict с информацией о товаре
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
    product_id = params.get('id', '')
    
    if not product_id:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Product ID is required'}),
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    cursor.execute(
        "SELECT id, name, description, price, category, image_url, stock_quantity, created_at FROM products WHERE id = " + product_id
    )
    
    product = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not product:
        return {
            'statusCode': 404,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Product not found'}),
            'isBase64Encoded': False
        }
    
    product_data = {
        'id': product['id'],
        'name': product['name'],
        'description': product['description'],
        'price': float(product['price']),
        'category': product['category'],
        'image': product['image_url'],
        'stock_quantity': product['stock_quantity'],
        'created_at': product['created_at'].isoformat() if product['created_at'] else None
    }
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'product': product_data}),
        'isBase64Encoded': False
    }
