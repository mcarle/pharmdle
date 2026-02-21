# --- Lambda archives ---

data "archive_file" "get_daily_drug" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/getDailyDrug"
  output_path = "${path.module}/lambdas/getDailyDrug.zip"
}

data "archive_file" "rotate_daily_drug" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/rotateDailyDrug"
  output_path = "${path.module}/lambdas/rotateDailyDrug.zip"
}

# --- CloudWatch log groups ---

resource "aws_cloudwatch_log_group" "get_daily_drug" {
  name              = "/aws/lambda/getDailyDrug"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "rotate_daily_drug" {
  name              = "/aws/lambda/rotateDailyDrug"
  retention_in_days = 14
}

# --- Lambda functions ---

resource "aws_lambda_function" "get_daily_drug" {
  function_name    = "getDailyDrug"
  runtime          = "nodejs22.x"
  handler          = "index.handler"
  role             = aws_iam_role.get_daily_drug.arn
  filename         = data.archive_file.get_daily_drug.output_path
  source_code_hash = data.archive_file.get_daily_drug.output_base64sha256
  timeout          = 10
  memory_size      = 128

  environment {
    variables = {
      BUCKET_NAME    = aws_s3_bucket.pharmdle.id
      DAILY_DRUG_KEY = "daily_drug"
    }
  }

  depends_on = [aws_cloudwatch_log_group.get_daily_drug]
}

# --- getDailyDrug Function URL ---

resource "aws_lambda_function_url" "get_daily_drug" {
  function_name      = aws_lambda_function.get_daily_drug.function_name
  authorization_type = "NONE"

  cors {
    allow_origins = ["*"]
    allow_methods = ["GET"]
  }
}

resource "aws_lambda_permission" "function_url" {
  statement_id           = "FunctionURLAllowPublicAccess"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.get_daily_drug.function_name
  principal              = "*"
  function_url_auth_type = "NONE"
}

resource "aws_lambda_function" "rotate_daily_drug" {
  function_name    = "rotateDailyDrug"
  runtime          = "nodejs22.x"
  handler          = "index.handler"
  role             = aws_iam_role.rotate_daily_drug.arn
  filename         = data.archive_file.rotate_daily_drug.output_path
  source_code_hash = data.archive_file.rotate_daily_drug.output_base64sha256
  timeout          = 10
  memory_size      = 128

  environment {
    variables = {
      BUCKET_NAME    = aws_s3_bucket.pharmdle.id
      DRUG_DATA_KEY  = "drug_data"
      DAILY_DRUG_KEY = "daily_drug"
    }
  }

  depends_on = [aws_cloudwatch_log_group.rotate_daily_drug]
}
