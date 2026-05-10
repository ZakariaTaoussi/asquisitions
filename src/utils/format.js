export const formatValidationErrors = (errors) => {

    if (!errors || !Array.isArray(errors)) {
        return "Validation Failed";
    }

    return errors.map(err => err.message).join(', ');
}