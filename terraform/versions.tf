terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }

  backend "s3" {
    bucket         = "otail-terraform-state" # Will be overridden by backend config
    key            = "terraform.tfstate"     # Will be overridden by backend config
    region         = "us-west-2"             # Will be overridden by backend config
    encrypt        = true
    dynamodb_table = "terraform-state-lock" # Will be overridden by backend config
  }
}

# Get current AWS account ID
data "aws_caller_identity" "current" {}
