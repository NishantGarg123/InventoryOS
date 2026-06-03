from decimal import Decimal, InvalidOperation


def require_fields(data, fields):
    if not isinstance(data, dict):
        return "Request body must be a JSON object"
    missing = [f for f in fields if f not in data or data[f] in (None, "")]
    if missing:
        return f"Missing required fields: {', '.join(missing)}"
    return None


def parse_positive_decimal(value, field_name):
    try:
        amount = Decimal(str(value))
    except (InvalidOperation, TypeError):
        return None, f"{field_name} must be a valid number"
    if amount < 0:
        return None, f"{field_name} cannot be negative"
    return amount, None


def parse_non_negative_int(value, field_name):
    try:
        num = int(value)
    except (TypeError, ValueError):
        return None, f"{field_name} must be a valid integer"
    if num < 0:
        return None, f"{field_name} cannot be negative"
    return num, None


def parse_positive_int(value, field_name):
    num, err = parse_non_negative_int(value, field_name)
    if err:
        return None, err
    if num <= 0:
        return None, f"{field_name} must be greater than zero"
    return num, None
