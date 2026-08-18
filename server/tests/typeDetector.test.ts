import {
  parseNumberValue,
  parseDateValue,
  isBooleanValue,
  detectColumnType,
} from '../src/engine/typeDetector';

describe('typeDetector', () => {
  describe('parseNumberValue', () => {
    it('should parse standard numbers and numeric strings', () => {
      expect(parseNumberValue(42)).toBe(42);
      expect(parseNumberValue('42')).toBe(42);
      expect(parseNumberValue('123.45')).toBe(123.45);
      expect(parseNumberValue('-50.2')).toBe(-50.2);
    });

    it('should parse brazilian formatted numbers', () => {
      expect(parseNumberValue('1.250,50')).toBe(1250.5);
      expect(parseNumberValue('500,25')).toBe(500.25);
    });

    it('should parse currency and percentage strings', () => {
      expect(parseNumberValue('R$ 1.500,00')).toBe(1500);
      expect(parseNumberValue('$2,500.75')).toBe(2500.75);
      expect(parseNumberValue('25.5%')).toBe(25.5);
      expect(parseNumberValue('12,8%')).toBe(12.8);
    });

    it('should return null for invalid non-numeric values', () => {
      expect(parseNumberValue(null)).toBeNull();
      expect(parseNumberValue(undefined)).toBeNull();
      expect(parseNumberValue('')).toBeNull();
      expect(parseNumberValue('São Paulo')).toBeNull();
      expect(parseNumberValue('N/A')).toBeNull();
    });
  });

  describe('parseDateValue', () => {
    it('should parse ISO date strings', () => {
      const date = parseDateValue('2024-01-15');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2024);
    });

    it('should parse brazilian date strings DD/MM/YYYY', () => {
      const date = parseDateValue('15/01/2024');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getDate()).toBe(15);
      expect(date?.getMonth()).toBe(0);
      expect(date?.getFullYear()).toBe(2024);
    });

    it('should return null for non-date strings', () => {
      expect(parseDateValue('12345')).toBeNull();
      expect(parseDateValue('Produto ABC')).toBeNull();
      expect(parseDateValue(null)).toBeNull();
    });
  });

  describe('isBooleanValue', () => {
    it('should identify boolean primitives and strings', () => {
      expect(isBooleanValue(true)).toBe(true);
      expect(isBooleanValue(false)).toBe(true);
      expect(isBooleanValue('true')).toBe(true);
      expect(isBooleanValue('sim')).toBe(true);
      expect(isBooleanValue('não')).toBe(true);
      expect(isBooleanValue('yes')).toBe(true);
      expect(isBooleanValue('no')).toBe(true);
      expect(isBooleanValue('outro')).toBe(false);
    });
  });

  describe('detectColumnType', () => {
    it('should detect numeric columns', () => {
      const values = ['100', '250', '350.50', '400', '520'];
      expect(detectColumnType(values, 'Vendas')).toBe('numeric');
    });

    it('should detect date columns', () => {
      const values = ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04'];
      expect(detectColumnType(values, 'Data')).toBe('date');
    });

    it('should detect boolean columns', () => {
      const values = ['sim', 'não', 'sim', 'sim', 'não'];
      expect(detectColumnType(values, 'Ativo')).toBe('boolean');
    });

    it('should detect categorical columns when low distinct values', () => {
      const values = ['Sudeste', 'Sul', 'Sudeste', 'Nordeste', 'Sudeste', 'Sul'];
      expect(detectColumnType(values, 'Regiao')).toBe('categorical');
    });

    it('should detect id columns', () => {
      const values = ['CLI-001', 'CLI-002', 'CLI-003', 'CLI-004', 'CLI-005'];
      expect(detectColumnType(values, 'cliente_id')).toBe('id');
    });

    it('should fallback to text for high-cardinality strings', () => {
      const values = [
        'Cliente solicitou suporte adicional para módulo financeiro',
        'Reunião agendada com diretoria de expansão',
        'Contrato assinado em conformidade com as regras',
        'Feedback positivo sobre a agilidade no atendimento',
      ];
      expect(detectColumnType(values, 'Observacoes')).toBe('text');
    });
  });
});
