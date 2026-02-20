output "function_url" {
  description = "URL of the getDailyDrug Lambda Function URL"
  value       = aws_lambda_function_url.get_daily_drug.function_url
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket storing drug data"
  value       = aws_s3_bucket.pharmdle.id
}

output "get_daily_drug_lambda_arn" {
  description = "ARN of the getDailyDrug Lambda function"
  value       = aws_lambda_function.get_daily_drug.arn
}

output "rotate_daily_drug_lambda_arn" {
  description = "ARN of the rotateDailyDrug Lambda function"
  value       = aws_lambda_function.rotate_daily_drug.arn
}
