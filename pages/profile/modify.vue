<template>
    <view class="index-page" style="--wot-size-side-padding: 0">
        <view @click="handleUpload()" class="avatar">
            <image class="default" :src="formData.avatar || '/static/login/default.png'" mode=""></image>
            <image class="edit" src="/static/login/edit-2.png" mode=""></image>
            <!-- <wd-img :width="50" :height="50" :src="mergeImg(imgUrl)" :radius="50" /> -->
            <!-- 上传 -->
        </view>
        <view style="text-align: center; color: #757575; margin-bottom: 30rpx" class="">
            <view class="HarmonyOS_Sans_SC_Medium">{{ formData.createdAt }} 成为 意象视觉 会员</view>
            <view class="HarmonyOS_Sans_SC_Medium" style="margin-top: 10rpx">
                NO.{{ padToElevenDigits(formData.inviteCode) }}
            </view>
        </view>
        <view style="background-color: #fff; border-radius: 20rpx; padding: 30rpx">
            <wd-form ref="formRef" :model="formData" errorType="toast">
                <wd-cell-group border>
                    <wd-cell prop="phone" title="手机号" title-width="100px">
                        <wd-input
                            prop="phone"
                            disabled
                            v-model="formData.phone"
                            :no-border="true"
                            placeholder="请输入手机号"
                        />
                    </wd-cell>

                    <wd-input
                        label="昵称"
                        label-width="100px"
                        prop="nickname"
                        clearable
                        v-model="formData.nickname"
                        placeholder="请输入昵称"
                    />
                    <wd-input
                        label="姓名"
                        label-width="100px"
                        prop="name"
                        clearable
                        v-model="formData.name"
                        placeholder="请输入姓名"
                    />

                    <wd-datetime-picker
                        label-width="100px"
                        label="生日"
                        type="date"
                        v-model="formData.birthday"
                        placeholder="请选择"
                    />

                    <!--      <wd-cell prop="gender" title="性别" title-width="100px">
                        <wd-radio-group v-model="formData.gender">
                            <wd-radio :value="1">男</wd-radio>
                            <wd-radio :value="2">女</wd-radio>
                        </wd-radio-group>
                    </wd-cell> -->

                    <wd-picker
                        label-width="100px"
                        :columns="[
                            { value: 0, label: '男' },
                            { value: 1, label: '女' }
                        ]"
                        label="性别"
                        v-model="formData.gender"
                        @confirm="handleConfirm"
                    />
                </wd-cell-group>
                <wd-cell border @click="outLogin" title="退出登录" isLink title-width="100px"></wd-cell>
                <view class="regsiter">
                    <view @click="handleSubmit" class="main">保存</view>
                </view>
            </wd-form>
        </view>
    </view>
</template>

<script setup>
import { ref, reactive, nextTick, computed } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { useGlobalStore } from '../../store/global'
const { userInfo, token } = useGlobalStore()
import { baseUrl, uploadBaseUrl } from '../../utils/config'
import { useUploadFile } from '../../utils/useUpload'
import { substringFrom, mergeImg, padToElevenDigits } from '../../utils/tools'
import { cloneDeep } from 'lodash-es'
import { editProfile } from '../../api'

const profile = userInfo

const formRef = ref()
const formData = ref({})
onLoad((options) => {
    formData.value = {
        phone: profile.phone,
        createdAt: profile.createdAt || '',
        avatar: profile.avatar || '',
        inviteCode: profile.id || '',
        nickname: profile.nickname || '',
        birthday: Number(profile.birthday) || new Date().getTime(),
        gender: profile.gender || '',
        name: profile.name || ''
    }
    console.log(formData.value)
})
onUnload(() => {})
function handleConfirm(e) {
    console.log(e)
}
const imgUrl = computed(() => {
    if (formData.value.avatar) {
        return mergeImg(formData.value.avatar)
    } else {
        return '/static/logo.jpg'
    }
})
function outLogin() {
    uni.showModal({
        title: '提示',
        content: '确定要退出登录吗',
        success({ confirm }) {
            if (confirm) {
                useGlobalStore().clearUserInfo()
                uni.navigateBack()
            }
        }
    })
}
function handleSubmit() {
    formRef.value
        .validate()
        .then(async ({ valid, errors }) => {
            if (valid) {
                const data = cloneDeep(formData.value)
                if (userInfo.openid) delete data.username
                const res = await editProfile(data)
                useGlobalStore().$patch({
                    userInfo: res
                })
                uni.showToast({
                    title: '修改成功'
                })
            }
        })
        .catch((error) => {
            console.log(error, 'error')
        })
}
const { handleUpload } = useUploadFile({
    useOss: true,
    // 可选：自定义分类，默认是temp
    // 上传成功的回调
    onSuccess: (filePath) => {
        console.log('filePath', filePath)
        formData.value.avatar = filePath
    },
    // 可选：自定义失败回调
    onError: (err) => {
        if (err.statusCode === 400) {
            uni.showToast({
                title: '大小不超过2M',
                icon: 'error'
            })
            return
        }
        uni.showToast({
            title: '头像上传失败',
            icon: 'error'
        })
        console.log('', err)
    },
    // 可选：自定义进度回调
    onProgress: (progress) => {
        console.log('头像上传进度', progress)
    }
})
</script>
<style scoped lang="scss">
.footer {
    margin-top: 100px;
}
.regsiter {
    position: fixed;
    width: 80%;
    left: 50%;
    transform: translateX(-50%);
    bottom: 60rpx;
    font-family: 'HarmonyOS_Sans_SC_Bold';
    .top,
    .main {
        height: 120rpx;
        width: 100%;
        background-color: #000;
        border-radius: 120rpx;
        text-align: center;
        line-height: 120rpx;
        color: white;
        z-index: 10;
        font-size: 30rpx;
        position: relative;
    }
    .top {
        display: flex;
        background-color: #e3e3e3;
        color: #737373;
        position: absolute;
        z-index: 1;
        line-height: 70rpx;
        padding-left: 60rpx;
        transform: translateY(-50%);
    }
}
.avatar {
    display: flex;
    justify-content: center;
    margin: 40rpx 0;
    align-items: center;
    position: relative;
    .default {
        width: 150rpx;
        height: 150rpx;
        border-radius: 150rpx;
    }
    .edit {
        position: absolute;
        bottom: 0;
        right: 50%;
        transform: translateX(140%);
        width: 50rpx;
        height: 50rpx;
    }
}
</style>
