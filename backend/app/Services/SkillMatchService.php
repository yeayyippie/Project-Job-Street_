<?php

namespace App\Services;

class SkillMatchService{
public function calculate($userSkills, $jobRequirements)
{
    if (!is_array($userSkills) || !is_array($jobRequirements)) {
        return 0;
    }

    // SAMAKAN FORMAT
    $userSkills = array_map('strtolower', $userSkills);
    $jobRequirements = array_map('strtolower', $jobRequirements);

    $matched = array_intersect($userSkills, $jobRequirements);

    if (count($jobRequirements) === 0) return 0;

    return round((count($matched) / count($jobRequirements)) * 100);
}
}
