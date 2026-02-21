# --- getDailyDrug Lambda role ---

resource "aws_iam_role" "get_daily_drug" {
  name = "getDailyDrug-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "get_daily_drug" {
  name = "getDailyDrug-policy"
  role = aws_iam_role.get_daily_drug.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.pharmdle.arn}/daily_drug"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ]
        Resource = "${aws_cloudwatch_log_group.get_daily_drug.arn}:*"
      },
    ]
  })
}

# --- rotateDailyDrug Lambda role ---

resource "aws_iam_role" "rotate_daily_drug" {
  name = "rotateDailyDrug-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "rotate_daily_drug" {
  name = "rotateDailyDrug-policy"
  role = aws_iam_role.rotate_daily_drug.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.pharmdle.arn}/drug_data"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
        ]
        Resource = "${aws_s3_bucket.pharmdle.arn}/daily_drug"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ]
        Resource = "${aws_cloudwatch_log_group.rotate_daily_drug.arn}:*"
      },
    ]
  })
}
