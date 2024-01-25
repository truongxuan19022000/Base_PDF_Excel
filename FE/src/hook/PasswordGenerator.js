import { REGEX_PASSWORD } from 'src/constants/config';

function useRandomPasswordGenerator() {
  const generateRandomPassword = () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';
    const minLength = 8;
    const maxLength = 16;

    const getRandomCharacter = (charset) => {
      const randomIndex = Math.floor(Math.random() * charset.length);
      return charset[randomIndex];
    };

    const isValidPassword = (password) => {
      return REGEX_PASSWORD.test(password);
    };

    let password;

    do {
      const randomLength = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

      password = [
        getRandomCharacter('abcdefghijklmnopqrstuvwxyz'),
        getRandomCharacter('ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
        getRandomCharacter('0123456789'),
        getRandomCharacter('!@#$%^&*()-_=+[]{}|;:,.<>?')
      ].join('');

      while (password.length < randomLength) {
        password += getRandomCharacter(charset);
      }

      const actualLength = Math.min(password.length, maxLength);

      const passwordArray = password.slice(0, actualLength).split('');
      for (let i = passwordArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
      }

      password = passwordArray.join('');
    } while (!isValidPassword(password) || password.length > maxLength);

    return password;
  };

  return generateRandomPassword;
}

export default useRandomPasswordGenerator;
