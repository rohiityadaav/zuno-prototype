import json
import boto3
from decimal import Decimal
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
summary_table = dynamodb.Table('ZunoUserSummary')

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def lambda_handler(event, context):
    """
    AWS Lambda triggered by DynamoDB Streams on the TransactionLedger table.
    Maintains a real-time 'At-a-Glance' summary for the user.
    """
    for record in event['Records']:
        if record['eventName'] == 'INSERT':
            new_image = record['dynamodb']['NewImage']
            
            # Extract attributes
            user_id = new_image['PK']['S'].split('#')[1]
            amount = Decimal(new_image['Amount']['N'])
            tx_type = new_image['Type']['S'] # Sale, Purchase, Credit
            category = new_image['Category']['S'] # Inventory, Udhaar
            
            # Update User Summary
            update_expression = "SET total_revenue = if_not_exists(total_revenue, :zero) + :rev, " \
                                "cogs = if_not_exists(cogs, :zero) + :cogs, " \
                                "trapped_capital = if_not_exists(trapped_capital, :zero) + :cap, " \
                                "last_updated = :now"
            
            expression_values = {
                ':zero': Decimal(0),
                ':now': datetime.utcnow().isoformat(),
                ':rev': amount if tx_type == 'Sale' else Decimal(0),
                ':cogs': amount if tx_type == 'Purchase' else Decimal(0),
                ':cap': amount if tx_type == 'Credit' else Decimal(0)
            }
            
            try:
                summary_table.update_item(
                    Key={'UserId': user_id},
                    UpdateExpression=update_expression,
                    ExpressionAttributeValues=expression_values
                )
                print(f"Successfully updated summary for user {user_id}")
            except Exception as e:
                print(f"Error updating summary: {str(e)}")
                
    return {
        'statusCode': 200,
        'body': json.dumps('Summary updated successfully')
    }
