<?php

declare(strict_types=1);

namespace App\Helpers;

class Time
{
    /**
     * Format a duration in seconds as "Xh Ym Zs".
     */
    public static function format(int $totalSeconds): string
    {
        $hours = intdiv($totalSeconds, 3600);
        $minutes = intdiv($totalSeconds % 3600, 60);
        $seconds = $totalSeconds % 60;

        return "{$hours}h {$minutes}m {$seconds}s";
    }
}
