# --- Daily rotation schedule (EventBridge Scheduler) ---

resource "aws_iam_role" "scheduler" {
  name = "Amazon_EventBridge_Scheduler_LAMBDA_2dee63c574"
  path = "/service-role/"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "scheduler.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "scheduler" {
  name = "scheduler-invoke-lambda"
  role = aws_iam_role.scheduler.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "lambda:InvokeFunction"
      Resource = aws_lambda_function.rotate_daily_drug.arn
    }]
  })
}

resource "aws_scheduler_schedule" "rotate_daily_drug" {
  name        = "rotateDailyDrug"
  group_name  = "default"
  description = "Runs rotateDailyDrug lambda"

  schedule_expression          = "cron(0 0 * * ? *)"
  schedule_expression_timezone = "America/Chicago"

  flexible_time_window {
    mode                      = "FLEXIBLE"
    maximum_window_in_minutes = 15
  }

  target {
    arn      = aws_lambda_function.rotate_daily_drug.arn
    role_arn = aws_iam_role.scheduler.arn

    retry_policy {
      maximum_event_age_in_seconds = 86400
      maximum_retry_attempts       = 0
    }
  }
}
