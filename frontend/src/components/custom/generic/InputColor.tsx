import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  hexToRgb,
  hexToRgba,
  hslToRgb,
  hslaToRgba,
  rgbToHex,
  rgbToHsl,
  rgbaToHex,
  rgbaToHsla,
} from '@/helpers/color-converter';
import { cn } from '@/utils/cn-utils';
import { Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { HexAlphaColorPicker, HexColorPicker } from 'react-colorful';
import { z } from 'zod';

const FALLBACK_COLOR = '#E05A2D';

const colorSchema = z
  .string()
  .regex(
    /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/,
    'Color must be a valid hex color (e.g., #FF0000 or #FF0000FF)',
  )
  .transform((val) => val.toUpperCase());

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  isLoading?: boolean;
  label: string;
  placeholder?: string;
  error?: string;
  className?: string;
  alpha?: boolean;
}

interface ColorValues {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  rgba?: { r: number; g: number; b: number; a: number };
  hsla?: { h: number; s: number; l: number; a: number };
}

function initColorValues(value: string, alpha: boolean): ColorValues {
  const safeValue = /^#[0-9A-Fa-f]{6,8}$/.test(value) ? value : FALLBACK_COLOR;
  if (alpha) {
    const rgba = hexToRgba(safeValue);
    const hsla = rgbaToHsla(rgba.r, rgba.g, rgba.b, rgba.a);
    return {
      hex: safeValue.length === 9 ? safeValue.slice(0, 7) : safeValue,
      rgb: { r: rgba.r, g: rgba.g, b: rgba.b },
      hsl: rgbToHsl(rgba.r, rgba.g, rgba.b),
      rgba,
      hsla,
    };
  }
  const rgb = hexToRgb(safeValue);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return { hex: safeValue, rgb, hsl };
}

export default function InputColor({
  value,
  onChange,
  onBlur,
  isLoading = false,
  label,
  placeholder,
  error,
  className = 'mt-6',
  alpha = false,
}: ColorPickerProps) {
  const [colorFormat, setColorFormat] = useState(alpha ? 'HEXA' : 'HEX');
  const [colorValues, setColorValues] = useState<ColorValues>(() =>
    initColorValues(value, alpha),
  );
  const [hexInputValue, setHexInputValue] = useState(value);
  const [hexInputError, setHexInputError] = useState<string | null>(null);

  const updateColorValues = useCallback(
    (newColor: string) => {
      if (alpha) {
        const rgba = hexToRgba(newColor);
        const hsla = rgbaToHsla(rgba.r, rgba.g, rgba.b, rgba.a);
        setColorValues({
          hex: newColor.length === 9 ? newColor.slice(0, 7) : newColor,
          rgb: { r: rgba.r, g: rgba.g, b: rgba.b },
          hsl: rgbToHsl(rgba.r, rgba.g, rgba.b),
          rgba,
          hsla,
        });
        setHexInputValue(newColor.toUpperCase());
      } else {
        const rgb = hexToRgb(newColor);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        setColorValues({ hex: newColor.toUpperCase(), rgb, hsl });
        setHexInputValue(newColor.toUpperCase());
      }
    },
    [alpha],
  );

  const handleColorChange = (newColor: string) => {
    updateColorValues(newColor);
    onChange(newColor);
  };

  const handleHexChange = (input: string) => {
    let formatted = input.toUpperCase();
    if (!formatted.startsWith('#')) formatted = '#' + formatted;

    const maxLength = alpha ? 9 : 7;
    if (formatted.length <= maxLength && /^#[0-9A-Fa-f]*$/.test(formatted)) {
      setHexInputValue(formatted);
      onChange(formatted);
      updateColorValues(formatted);
      try {
        if (formatted.length === maxLength) {
          colorSchema.parse(formatted);
          setHexInputError(null);
        } else {
          setHexInputError('Enter a valid color');
        }
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          setHexInputError('Enter a valid color');
        }
      }
    }
  };

  const handleRgbChange = (component: 'r' | 'g' | 'b', input: string) => {
    const clamped = Math.max(0, Math.min(255, parseInt(input) || 0));
    const newRgb = { ...colorValues.rgb, [component]: clamped };
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    const hsl = rgbToHsl(newRgb.r, newRgb.g, newRgb.b);
    setColorValues({ ...colorValues, hex, rgb: newRgb, hsl });
    onChange(hex);
  };

  const handleRgbaChange = (
    component: 'r' | 'g' | 'b' | 'a',
    input: string,
  ) => {
    if (!alpha || !colorValues.rgba) return;
    const numValue = parseFloat(input) || 0;
    const clamped =
      component === 'a'
        ? Math.max(0, Math.min(1, numValue))
        : Math.max(0, Math.min(255, Math.floor(numValue)));
    const newRgba = { ...colorValues.rgba, [component]: clamped };
    const hex = rgbaToHex(newRgba.r, newRgba.g, newRgba.b, newRgba.a);
    const hsla = rgbaToHsla(newRgba.r, newRgba.g, newRgba.b, newRgba.a);
    setColorValues({
      ...colorValues,
      hex: hex.slice(0, 7),
      rgb: { r: newRgba.r, g: newRgba.g, b: newRgba.b },
      hsl: rgbToHsl(newRgba.r, newRgba.g, newRgba.b),
      rgba: newRgba,
      hsla,
    });
    onChange(hex);
  };

  const handleHslChange = (component: 'h' | 's' | 'l', input: string) => {
    const numValue = parseInt(input) || 0;
    const clamped =
      component === 'h'
        ? Math.max(0, Math.min(360, numValue))
        : Math.max(0, Math.min(100, numValue));
    const newHsl = { ...colorValues.hsl, [component]: clamped };
    const rgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    setColorValues({ ...colorValues, hex, rgb, hsl: newHsl });
    onChange(hex);
  };

  const handleHslaChange = (
    component: 'h' | 's' | 'l' | 'a',
    input: string,
  ) => {
    if (!alpha || !colorValues.hsla) return;
    const numValue = parseFloat(input) || 0;
    const clamped =
      component === 'a'
        ? Math.max(0, Math.min(1, numValue))
        : component === 'h'
          ? Math.max(0, Math.min(360, numValue))
          : Math.max(0, Math.min(100, numValue));
    const newHsla = { ...colorValues.hsla, [component]: clamped };
    const rgba = hslaToRgba(newHsla.h, newHsla.s, newHsla.l, newHsla.a);
    const hex = rgbaToHex(rgba.r, rgba.g, rgba.b, rgba.a);
    setColorValues({
      ...colorValues,
      hex: hex.slice(0, 7),
      rgb: { r: rgba.r, g: rgba.g, b: rgba.b },
      hsl: { h: newHsla.h, s: newHsla.s, l: newHsla.l },
      rgba,
      hsla: newHsla,
    });
    onChange(hex);
  };

  const handlePopoverChange = (open: boolean) => {
    if (!open) {
      setColorFormat(alpha ? 'HEXA' : 'HEX');
      onBlur();
    }
  };

  // useEffect(() => {
  //   if (value) {
  //     updateColorValues(value);
  //   }
  // }, [value, updateColorValues]);

  const getCurrentHexValue = () => {
    if (colorFormat === 'HEX' || colorFormat === 'HEXA') return hexInputValue;
    if (alpha && colorValues.rgba) {
      return rgbaToHex(
        colorValues.rgba.r,
        colorValues.rgba.g,
        colorValues.rgba.b,
        colorValues.rgba.a,
      );
    }
    return colorValues.hex;
  };

  const pickerColor = /^#[0-9A-Fa-f]{6,8}$/.test(value)
    ? value
    : FALLBACK_COLOR;

  return (
    <div className={cn(className)}>
      <Label className="mb-3">{label}</Label>
      <div className="flex items-center gap-4">
        <Popover onOpenChange={handlePopoverChange}>
          <PopoverTrigger asChild>
            <Button
              className="border-border h-12 w-12 border shadow-none relative overflow-hidden"
              size="icon"
              style={{ backgroundColor: hexInputValue || FALLBACK_COLOR }}
            >
              {alpha && colorValues.rgba && colorValues.rgba.a < 1 && (
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%),
                                    linear-gradient(-45deg, #ccc 25%, transparent 25%),
                                    linear-gradient(45deg, transparent 75%, #ccc 75%),
                                    linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
                    backgroundSize: '8px 8px',
                    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                  }}
                />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <div className="color-picker space-y-3">
              <div className="relative">
                {alpha ? (
                  <HexAlphaColorPicker
                    className="aspect-square! h-[244.79px]! w-[244.79px]!"
                    color={pickerColor}
                    onChange={handleColorChange}
                  />
                ) : (
                  <HexColorPicker
                    className="aspect-square! h-[244.79px]! w-[244.79px]!"
                    color={pickerColor}
                    onChange={handleColorChange}
                  />
                )}
              </div>
              <div className="flex gap-2">
                <Select value={colorFormat} onValueChange={setColorFormat}>
                  <SelectTrigger className="!h-7 !w-[4.8rem] rounded-sm px-2 py-1 !text-sm">
                    <SelectValue placeholder="Color" />
                  </SelectTrigger>
                  <SelectContent className="min-w-20">
                    {alpha ? (
                      <>
                        <SelectItem value="HEXA" className="text-sm h-7">
                          HEXA
                        </SelectItem>
                        <SelectItem value="RGBA" className="text-sm h-7">
                          RGBA
                        </SelectItem>
                        <SelectItem value="HSLA" className="text-sm h-7">
                          HSLA
                        </SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="HEX" className="text-sm h-7">
                          HEX
                        </SelectItem>
                        <SelectItem value="RGB" className="text-sm h-7">
                          RGB
                        </SelectItem>
                        <SelectItem value="HSL" className="text-sm h-7">
                          HSL
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>

                {colorFormat === 'HEX' || colorFormat === 'HEXA' ? (
                  <Input
                    className="h-7 w-[160px] rounded-sm text-sm"
                    value={getCurrentHexValue()}
                    onChange={(e) => handleHexChange(e.target.value)}
                    placeholder={alpha ? '#FF0000FF' : '#FF0000'}
                    maxLength={alpha ? 9 : 7}
                  />
                ) : colorFormat === 'RGB' ? (
                  <div className="flex items-center">
                    <Input
                      className="h-7 w-13 rounded-l-sm rounded-r-none text-center text-sm"
                      value={colorValues.rgb.r}
                      onChange={(e) => handleRgbChange('r', e.target.value)}
                      placeholder="255"
                      maxLength={3}
                    />
                    <Input
                      className="h-7 w-13 rounded-none border-x-0 text-center text-sm"
                      value={colorValues.rgb.g}
                      onChange={(e) => handleRgbChange('g', e.target.value)}
                      placeholder="255"
                      maxLength={3}
                    />
                    <Input
                      className="h-7 w-13 rounded-l-none rounded-r-sm text-center text-sm"
                      value={colorValues.rgb.b}
                      onChange={(e) => handleRgbChange('b', e.target.value)}
                      placeholder="255"
                      maxLength={3}
                    />
                  </div>
                ) : colorFormat === 'RGBA' && alpha && colorValues.rgba ? (
                  <div className="flex items-center">
                    <Input
                      className="h-7 w-10 rounded-l-sm rounded-r-none text-center text-sm px-1"
                      value={colorValues.rgba.r}
                      onChange={(e) => handleRgbaChange('r', e.target.value)}
                      placeholder="255"
                      maxLength={3}
                    />
                    <Input
                      className="h-7 w-10 rounded-none border-x-0 text-center text-sm px-1"
                      value={colorValues.rgba.g}
                      onChange={(e) => handleRgbaChange('g', e.target.value)}
                      placeholder="255"
                      maxLength={3}
                    />
                    <Input
                      className="h-7 w-10 rounded-none border-x-0 text-center text-sm px-1"
                      value={colorValues.rgba.b}
                      onChange={(e) => handleRgbaChange('b', e.target.value)}
                      placeholder="255"
                      maxLength={3}
                    />
                    <Input
                      className="h-7 w-10 rounded-l-none rounded-r-sm text-center text-sm px-1"
                      value={colorValues.rgba.a.toFixed(2)}
                      onChange={(e) => handleRgbaChange('a', e.target.value)}
                      placeholder="1.00"
                      maxLength={4}
                    />
                  </div>
                ) : colorFormat === 'HSL' ? (
                  <div className="flex items-center">
                    <Input
                      className="h-7 w-13 rounded-l-sm rounded-r-none text-center text-sm"
                      value={colorValues.hsl.h}
                      onChange={(e) => handleHslChange('h', e.target.value)}
                      placeholder="360"
                      maxLength={3}
                    />
                    <Input
                      className="h-7 w-13 rounded-none border-x-0 text-center text-sm"
                      value={colorValues.hsl.s}
                      onChange={(e) => handleHslChange('s', e.target.value)}
                      placeholder="100"
                      maxLength={3}
                    />
                    <Input
                      className="h-7 w-13 rounded-l-none rounded-r-sm text-center text-sm"
                      value={colorValues.hsl.l}
                      onChange={(e) => handleHslChange('l', e.target.value)}
                      placeholder="100"
                      maxLength={3}
                    />
                  </div>
                ) : colorFormat === 'HSLA' && alpha && colorValues.hsla ? (
                  <div className="flex items-center">
                    <Input
                      className="h-7 w-10 px-1 rounded-l-sm rounded-r-none text-center text-sm"
                      value={colorValues.hsla.h}
                      onChange={(e) => handleHslaChange('h', e.target.value)}
                      placeholder="360"
                      maxLength={3}
                    />
                    <Input
                      className="h-7 w-10 px-1 rounded-none border-x-0 text-center text-sm"
                      value={colorValues.hsla.s}
                      onChange={(e) => handleHslaChange('s', e.target.value)}
                      placeholder="100"
                      maxLength={3}
                    />
                    <Input
                      className="h-7 w-10 px-1 rounded-none border-x-0 text-center text-sm"
                      value={colorValues.hsla.l}
                      onChange={(e) => handleHslaChange('l', e.target.value)}
                      placeholder="100"
                      maxLength={3}
                    />
                    <Input
                      className="h-7 w-10 px-1 rounded-l-none rounded-r-sm text-center text-sm"
                      value={colorValues.hsla.a.toFixed(2)}
                      onChange={(e) => handleHslaChange('a', e.target.value)}
                      placeholder="1.00"
                      maxLength={4}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="relative flex-1 sm:flex-none">
          <Input
            placeholder={placeholder || (alpha ? '#FF0000FF' : '#FF0000')}
            value={getCurrentHexValue()}
            onChange={(e) => handleHexChange(e.target.value)}
            onBlur={onBlur}
            className={cn('h-12 uppercase', error && 'border-destructive')}
          />
          {isLoading && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-4">
              <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
            </span>
          )}
        </div>
      </div>
      {error && <p className="text-destructive mt-1.5 text-sm">{error}</p>}
      {hexInputError && (
        <p className="text-destructive mt-1.5 text-sm">{hexInputError}</p>
      )}
    </div>
  );
}
