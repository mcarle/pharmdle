variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "pharmdle"
}

variable "aws_account_id" {
  description = "AWS account ID used for resource naming"
  type        = string
  default     = "842817210846"
}

variable "drug_data_file" {
  description = "Local path to the drug_data.json file"
  type        = string
  default     = "../utils/drug_data.json"
}

variable "daily_drug_default" {
  description = "Initial daily drug value"
  type        = string
  default     = "fentanyl"
}

variable "alarm_email" {
  description = "Email address for CloudWatch alarm notifications"
  type        = string
  default     = "mattcarle15@gmail.com"
}
