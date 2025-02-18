# OTail Infrastructure

This directory contains the Terraform configuration for the OTail infrastructure.

## Setup

1. Copy `terraform.tfvars.example` to `terraform.tfvars`:
```bash
cp terraform.tfvars.example terraform.tfvars
```

2. Edit `terraform.tfvars` with your specific values:
- `aws_region`: Your AWS region
- `environment`: Environment name (dev/prod)
- `domain_name`: Your domain name
- `github_org`: Your GitHub organization
- `github_repo`: Your GitHub repository name
- `terraform_state_bucket`: Your S3 bucket for Terraform state
- `alert_email`: Email for alerts

3. Initialize Terraform:
```bash
terraform init
```

4. Plan and apply:
```bash
terraform plan
terraform apply
```

## Security Notes

- All sensitive information (passwords, credentials) is managed through AWS Secrets Manager
- KMS is used for encryption
- The DocumentDB password is automatically generated and stored securely
- The infrastructure uses private subnets for sensitive components
- SSL/TLS is enabled for all services

## Components

- VPC with public and private subnets
- ECS Fargate cluster
- DocumentDB cluster
- CloudFront distribution
- ACM certificates
- CloudWatch monitoring
- IAM roles and policies
