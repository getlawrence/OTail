resource "aws_acm_certificate" "main" {
  domain_name               = var.domain_name
  subject_alternative_names = ["*.${var.domain_name}"]
  validation_method         = "EMAIL"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Environment = var.environment
    Terraform   = "true"
  }
}

# Frontend CloudFront Distribution DNS
output "cloudfront_domain" {
  value = try(aws_cloudfront_distribution.frontend.domain_name, "")
}

output "cloudfront_zone_id" {
  value = try(aws_cloudfront_distribution.frontend.hosted_zone_id, "")
}
