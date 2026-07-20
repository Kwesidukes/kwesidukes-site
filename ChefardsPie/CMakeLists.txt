cmake_minimum_required(VERSION 3.22)

project(ChefardsPie VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

if (NOT CMAKE_OSX_DEPLOYMENT_TARGET)
    set(CMAKE_OSX_DEPLOYMENT_TARGET "11.0" CACHE STRING "Minimum macOS deployment target" FORCE)
endif()

# JUCE is brought in as a git submodule at ./JUCE (see README / build instructions).
if (NOT EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/JUCE/CMakeLists.txt")
    message(FATAL_ERROR
        "JUCE not found at ${CMAKE_CURRENT_SOURCE_DIR}/JUCE.\n"
        "Run:\n"
        "  git submodule add https://github.com/juce-framework/JUCE.git JUCE\n"
        "  git submodule update --init --recursive\n"
        "from the ChefardsPie/ directory, then re-run CMake configure.")
endif()

add_subdirectory(JUCE)

juce_add_plugin(ChefardsPie
    COMPANY_NAME                "Super Chef Beats"
    BUNDLE_ID                   "com.superchefbeats.chefardspie"
    PLUGIN_MANUFACTURER_CODE    Scbt
    PLUGIN_CODE                 Cpie
    PRODUCT_NAME                "Chefards Pie"
    FORMATS                     Standalone VST3 AU
    IS_SYNTH                    TRUE
    NEEDS_MIDI_INPUT            TRUE
    NEEDS_MIDI_OUTPUT           FALSE
    IS_MIDI_EFFECT              FALSE
    EDITOR_WANTS_KEYBOARD_FOCUS FALSE
    COPY_PLUGIN_AFTER_BUILD     TRUE
    VST3_CATEGORIES             Instrument Synth
    AU_MAIN_TYPE                kAudioUnitType_MusicDevice
)

juce_generate_juce_header(ChefardsPie)

target_sources(ChefardsPie
    PRIVATE
        Source/PluginProcessor.cpp
        Source/PluginProcessor.h
        Source/PluginEditor.cpp
        Source/PluginEditor.h
)

target_compile_definitions(ChefardsPie
    PUBLIC
        JUCE_ALSA=0
        JUCE_DIRECTSOUND=0
        JUCE_WEB_BROWSER=0
        JUCE_USE_CURL=0
        JUCE_VST3_CAN_REPLACE_VST2=0
        JUCE_DISPLAY_SPLASH_SCREEN=0
        JUCE_STRICT_REFCOUNTEDPOINTER=1
)

target_link_libraries(ChefardsPie
    PRIVATE
        juce::juce_audio_utils
        juce::juce_dsp
    PUBLIC
        juce::juce_recommended_config_flags
        juce::juce_recommended_lto_flags
        juce::juce_recommended_warning_flags
)

# Alpha 0.1: keep warnings visible but not fatal, per project working rules.
if (MSVC)
    target_compile_options(ChefardsPie PRIVATE /W4)
else()
    target_compile_options(ChefardsPie PRIVATE -Wall -Wextra)
endif()
