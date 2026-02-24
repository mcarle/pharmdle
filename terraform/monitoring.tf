# --- SNS Topic for alarm notifications ---

resource "aws_sns_topic" "alarms" {
  name = "${var.project_name}-alarms"
}

resource "aws_sns_topic_subscription" "alarm_email" {
  topic_arn = aws_sns_topic.alarms.arn
  protocol  = "email"
  endpoint  = var.alarm_email
}

# --- CloudWatch Dashboard ---

resource "aws_cloudwatch_dashboard" "pharmdle" {
  dashboard_name = "Pharmdle"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "text"
        x      = 0
        y      = 0
        width  = 24
        height = 1
        properties = {
          markdown = "# getDailyDrug"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 1
        width  = 6
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", "getDailyDrug", { stat = "Sum" }]
          ]
          title  = "Invocations"
          region = var.aws_region
          period = 300
        }
      },
      {
        type   = "metric"
        x      = 6
        y      = 1
        width  = 6
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Errors", "FunctionName", "getDailyDrug", { stat = "Sum" }]
          ]
          title  = "Errors"
          region = var.aws_region
          period = 300
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 1
        width  = 6
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Duration", "FunctionName", "getDailyDrug", { stat = "Average" }],
            ["AWS/Lambda", "Duration", "FunctionName", "getDailyDrug", { stat = "p99" }]
          ]
          title  = "Duration (avg / p99)"
          region = var.aws_region
          period = 300
        }
      },
      {
        type   = "metric"
        x      = 18
        y      = 1
        width  = 6
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Throttles", "FunctionName", "getDailyDrug", { stat = "Sum" }]
          ]
          title  = "Throttles"
          region = var.aws_region
          period = 300
        }
      },
      {
        type   = "text"
        x      = 0
        y      = 7
        width  = 24
        height = 1
        properties = {
          markdown = "# rotateDailyDrug"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 8
        width  = 6
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", "rotateDailyDrug", { stat = "Sum" }]
          ]
          title  = "Invocations"
          region = var.aws_region
          period = 300
        }
      },
      {
        type   = "metric"
        x      = 6
        y      = 8
        width  = 6
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Errors", "FunctionName", "rotateDailyDrug", { stat = "Sum" }]
          ]
          title  = "Errors"
          region = var.aws_region
          period = 300
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 8
        width  = 6
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Duration", "FunctionName", "rotateDailyDrug", { stat = "Average" }],
            ["AWS/Lambda", "Duration", "FunctionName", "rotateDailyDrug", { stat = "p99" }]
          ]
          title  = "Duration (avg / p99)"
          region = var.aws_region
          period = 300
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 14
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "UrlRequestCount", "FunctionName", "getDailyDrug", { stat = "Sum" }]
          ]
          title  = "Function URL Request Count"
          region = var.aws_region
          period = 300
        }
      }
    ]
  })
}

# --- CloudWatch Alarms ---

resource "aws_cloudwatch_metric_alarm" "get_daily_drug_errors" {
  alarm_name          = "${var.project_name}-getDailyDrug-errors"
  alarm_description   = "getDailyDrug Lambda errors"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 1
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = aws_lambda_function.get_daily_drug.function_name
  }

  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]
}

resource "aws_cloudwatch_metric_alarm" "get_daily_drug_high_latency" {
  alarm_name          = "${var.project_name}-getDailyDrug-high-latency"
  alarm_description   = "getDailyDrug Lambda average duration exceeds 3 seconds"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Average"
  threshold           = 3000
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = aws_lambda_function.get_daily_drug.function_name
  }

  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]
}

resource "aws_cloudwatch_metric_alarm" "rotate_daily_drug_errors" {
  alarm_name          = "${var.project_name}-rotateDailyDrug-errors"
  alarm_description   = "rotateDailyDrug Lambda errors"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 86400
  statistic           = "Sum"
  threshold           = 1
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = aws_lambda_function.rotate_daily_drug.function_name
  }

  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]
}

resource "aws_cloudwatch_metric_alarm" "rotate_daily_drug_missed" {
  alarm_name          = "${var.project_name}-rotateDailyDrug-missed"
  alarm_description   = "rotateDailyDrug Lambda did not run in the last 24 hours"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Invocations"
  namespace           = "AWS/Lambda"
  period              = 86400
  statistic           = "Sum"
  threshold           = 1
  treat_missing_data  = "breaching"

  dimensions = {
    FunctionName = aws_lambda_function.rotate_daily_drug.function_name
  }

  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]
}
