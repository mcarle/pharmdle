terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# --- S3 bucket ---

resource "aws_s3_bucket" "pharmdle" {
  bucket        = "${var.aws_account_id}-drug-names"
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "pharmdle" {
  bucket = aws_s3_bucket.pharmdle.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# --- S3 objects ---

resource "aws_s3_object" "drug_data" {
  bucket       = aws_s3_bucket.pharmdle.id
  key          = "drug_data"
  source       = var.drug_data_file
  etag         = filemd5(var.drug_data_file)
  content_type = "application/json"
}

resource "aws_s3_object" "daily_drug" {
  bucket       = aws_s3_bucket.pharmdle.id
  key          = "daily_drug"
  content      = jsonencode({ name = var.daily_drug_default })
  content_type = "application/json"

  lifecycle {
    ignore_changes = [content, etag]
  }
}
