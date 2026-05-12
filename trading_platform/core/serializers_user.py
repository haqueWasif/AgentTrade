from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = get_user_model()
        fields = ["id", "username", "email", "password", "password_confirm"]

    def validate_username(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError("Username is required.")

        User = get_user_model()
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken. Please choose another one.")

        return value

    def validate_email(self, value):
        value = value.strip().lower()

        if value:
            User = get_user_model()
            if User.objects.filter(email__iexact=value).exists():
                raise serializers.ValidationError("This email is already registered.")

        return value

    def validate(self, attrs):
        password = attrs.get("password")
        password_confirm = attrs.get("password_confirm")

        if password != password_confirm:
            raise serializers.ValidationError({
                "password_confirm": "Passwords do not match."
            })

        try:
            validate_password(password)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({
                "password": list(exc.messages)
            })

        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")

        User = get_user_model()
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )