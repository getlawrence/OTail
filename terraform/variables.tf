variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-2"
}

variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "azs" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-east-2a", "us-east-2b", "us-east-2c"]
}

variable "private_subnets" {
  description = "Private subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnets" {
  description = "Public subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

variable "database_subnets" {
  description = "Database subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.201.0/24", "10.0.202.0/24", "10.0.203.0/24"]
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
}

variable "alert_email" {
  description = "Email address for alerts"
  type        = string
  default     = ""
}

variable "github_org" {
  description = "GitHub organization name"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
}

variable "ecr_repository" {
  description = "Name of the ECR repository for the backend"
  type        = string
  default     = "otail-backend"
}

variable "terraform_state_bucket" {
  description = "Name of the S3 bucket for Terraform state"
  type        = string
}

variable "elb_account_id" {
  description = "AWS Elastic Load Balancing Account ID per region for access logs"
  type        = map(string)
  default = {
    "us-west-2" = "797873946194" # US West (Oregon)
    "us-east-1" = "127311923021" # US East (N. Virginia)
    "us-east-2" = "033677994240" # US East (Ohio)
    "eu-west-1" = "156460612806" # EU (Ireland)
  }
}