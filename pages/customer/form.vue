<template>
  <view class="page">
    <!-- <wd-navbar
      title="修改信息"
      left-arrow
      fixed
      placeholder
      @click-left="goBack"
    /> -->

    <view class="form-container">
      <!-- 1. 基本信息 -->
      <view class="form-module">
        <view class="module-header" @click="toggleModule('basic')">
          <view class="title-left">
            <view class="blue-dot"></view>
            <text class="title-text">基本信息</text>
          </view>
          <view class="collapse-action">
            <text class="action-text">{{
              collapses.basic ? "展开" : "折叠"
            }}</text>
            <wd-icon
              :name="collapses.basic ? 'arrow-down' : 'arrow-up'"
              size="16px"
              color="#999"
            />
          </view>
        </view>
        <view v-show="!collapses.basic" class="module-body">
          <view class="field-item">
            <view class="field-label">门店名称</view>
            <wd-input
              v-model="formData.storeName"
              placeholder="请输入门店名称"
              no-border
            />
          </view>
          <view class="field-item">
            <view class="field-label">省市区</view>
            <wd-input
              v-model="areaDisplay"
              placeholder="请选择省市区"
              no-border
              suffix-icon="arrow"
              readonly
              @click="openAreaPicker"
            />
          </view>
          <view class="field-item">
            <view class="field-label">详细地址</view>
            <wd-input
              v-model="formData.address"
              placeholder="请输入详细地址"
              no-border
            />
          </view>
          <view class="field-row">
            <view class="field-item flex-1">
              <view class="field-label">经营状态</view>
              <DictSelectPicker
                v-model="formData.businessStatus"
                dict-key="WJ_BUSINESS_STATUS"
                title="选择经营状态"
              />
            </view>
            <view class="field-item flex-1">
              <view class="field-label">类别</view>
              <DictSelectPicker
                v-model="formData.category"
                dict-key="WJ_STORE_CATEGORY"
                title="选择类别"
              />
            </view>
          </view>
          <view class="field-row">
            <view class="field-item flex-1">
              <view class="field-label">所属连锁</view>
              <DictSelectPicker
                v-model="formData.chainCode"
                dict-key="WJ_CHAIN"
                title="选择所属连锁"
              />
            </view>
            <view class="field-item flex-1">
              <view class="field-label">所属派出所</view>
              <wd-input
                v-model="formData.policeStation"
                placeholder="请选择"
                no-border
                readonly
                suffix-icon="arrow"
                @click="openPolicePicker"
              />
            </view>
          </view>
          <view class="field-item">
            <view class="field-label">计费注册号</view>
            <wd-input
              v-model="formData.pubwinRegNo"
              placeholder="请输入计费注册号"
              no-border
            />
          </view>
          <view class="field-item">
            <view class="field-label">备注</view>
            <wd-input
              v-model="formData.remark"
              type="textarea"
              placeholder="请输入备注"
              no-border
            />
          </view>
        </view>
      </view>

      <!-- 2. 联系方式 -->
      <view class="form-module">
        <view class="module-header" @click="toggleModule('contact')">
          <view class="title-left">
            <view class="blue-dot"></view>
            <text class="title-text">联系方式</text>
          </view>
          <view class="collapse-action">
            <view class="action-btn-text" @click.stop="addContact">
              <wd-icon name="add" size="14px" />添加
            </view>
            <text class="action-text">{{
              collapses.contact ? "展开" : "折叠"
            }}</text>
            <wd-icon
              :name="collapses.contact ? 'arrow-down' : 'arrow-up'"
              size="16px"
              color="#999"
            />
          </view>
        </view>
        <view v-show="!collapses.contact" class="module-body">
          <view
            v-for="(item, idx) in formData.contactList"
            :key="idx"
            class="sub-card"
          >
            <view class="sub-card-header">
              <view class="tag-idx">{{ pad(idx + 1) }}</view>
              <text class="sub-title">{{ item.contactName || "未命名" }}</text>
              <view class="sub-actions">
                <wd-icon
                  name="delete"
                  size="16px"
                  color="#ee0a24"
                  @click="removeContact(idx)"
                />
              </view>
            </view>
            <view class="sub-card-content">
              <view class="field-item">
                <view class="field-label">联系人</view>
                <wd-input
                  v-model="item.contactName"
                  placeholder="请输入姓名"
                  no-border
                />
              </view>
              <view class="field-item">
                <view class="field-label">联系电话</view>
                <wd-input
                  v-model="item.phone"
                  placeholder="请输入电话"
                  no-border
                />
              </view>
              <view class="field-item">
                <view class="field-label">备注</view>
                <wd-input
                  v-model="item.remark"
                  placeholder="请输入备注"
                  no-border
                />
              </view>
            </view>
          </view>
          <view v-if="!formData.contactList?.length" class="empty-tip"
            >暂无联系人，点击上方添加</view
          >
        </view>
      </view>

      <!-- 3. 企业信息 -->
      <view class="form-module">
        <view class="module-header" @click="toggleModule('company')">
          <view class="title-left">
            <view class="blue-dot"></view>
            <text class="title-text">企业信息</text>
          </view>
          <view class="collapse-action">
            <text class="action-text">{{
              collapses.company ? "展开" : "折叠"
            }}</text>
            <wd-icon
              :name="collapses.company ? 'arrow-down' : 'arrow-up'"
              size="16px"
              color="#999"
            />
          </view>
        </view>
        <view v-show="!collapses.company" class="module-body">
          <view class="field-item">
            <view class="field-label">主体名称</view>
            <wd-input
              v-model="formData.companyName"
              placeholder="请输入主体名称"
              no-border
            />
          </view>
          <view class="field-item">
            <view class="field-label">法人名称</view>
            <wd-input
              v-model="formData.legalPerson"
              placeholder="请输入法人名称"
              no-border
            />
          </view>
          <view class="field-item">
            <view class="field-label">营业执照码</view>
            <wd-input
              v-model="formData.licenseNo"
              placeholder="请输入营业执照码"
              no-border
            />
          </view>
          <view class="upload-box">
            <view class="upload-title">上传营业执照</view>
            <ImgUpload
              v-model="formData.businessLicenseUrl"
              urlKey="businessLicenseUrl"
              category="WJ_CONTRACT_IMG"
              @extraData="handleExtraData"
              action="/wjapp/wjMobile/storeOcr"
            />
            <text class="upload-tip">上传后可自动识别企业信息</text>
          </view>
        </view>
      </view>

      <!-- 4. Pubwin 服务 -->
      <view class="form-module">
        <view class="module-header" @click="toggleModule('pubwin')">
          <view class="title-left">
            <view class="blue-dot"></view>
            <text class="title-text">Pubwin 服务</text>
          </view>
          <view class="collapse-action">
            <text class="action-text">{{
              collapses.pubwin ? "展开" : "折叠"
            }}</text>
            <wd-icon
              :name="collapses.pubwin ? 'arrow-down' : 'arrow-up'"
              size="16px"
              color="#999"
            />
          </view>
        </view>
        <view v-show="!collapses.pubwin" class="module-body">
          <view class="field-row">
            <view class="field-item flex-1">
              <view class="field-label">机器台数</view>
              <wd-input
                v-model="formData.pubwinMachineCount"
                placeholder="请输入"
                no-border
              />
            </view>
            <view class="field-item flex-1">
              <view class="field-label">年服务费</view>
              <wd-input
                v-model="formData.pubwinServiceFee"
                placeholder="请输入"
                no-border
              />
            </view>
          </view>
          <view class="field-row">
            <view class="field-item flex-1">
              <view class="field-label">到期开始时间</view>
              <wd-input
                v-model="formData.pubwinExpiredStartTime"
                placeholder="选择日期"
                no-border
                suffix-icon="calendar"
                readonly
                @click="openDatePicker('pubwinExpiredStartTime')"
              />
            </view>
            <view class="field-item flex-1">
              <view class="field-label">到期时间</view>
              <wd-input
                v-model="formData.pubwinExpireTime"
                placeholder="选择日期"
                no-border
                suffix-icon="calendar"
                readonly
                @click="openDatePicker('pubwinExpireTime')"
              />
            </view>
          </view>
        </view>
      </view>

      <!-- 5. 维护服务 -->
      <view class="form-module">
        <view class="module-header" @click="toggleModule('maintenance')">
          <view class="title-left">
            <view class="blue-dot"></view>
            <text class="title-text">维护服务</text>
          </view>
          <view class="collapse-action">
            <text class="action-text">{{
              collapses.maintenance ? "展开" : "折叠"
            }}</text>
            <wd-icon
              :name="collapses.maintenance ? 'arrow-down' : 'arrow-up'"
              size="16px"
              color="#999"
            />
          </view>
        </view>
        <view v-show="!collapses.maintenance" class="module-body">
          <view class="field-item">
            <view class="field-label">维护公司</view>
            <DictSelectPicker
              v-model="formData.maintenanceCompany"
              dict-key="WJ_MAINTENANCE"
              title="选择维护公司"
            />
          </view>
          <view class="field-row">
            <view class="field-item flex-1">
              <view class="field-label">年服务费</view>
              <wd-input
                v-model="formData.maintenanceFee"
                placeholder="请输入"
                no-border
              />
            </view>
          </view>
          <view class="field-row">
            <view class="field-item flex-1">
              <view class="field-label">到期开始时间</view>
              <wd-input
                v-model="formData.maintenanceExpiredStartTime"
                placeholder="选择日期"
                no-border
                suffix-icon="calendar"
                readonly
                @click="openDatePicker('maintenanceExpiredStartTime')"
              />
            </view>
            <view class="field-item flex-1">
              <view class="field-label">到期时间</view>
              <wd-input
                v-model="formData.maintenanceExpireTime"
                placeholder="选择日期"
                no-border
                suffix-icon="calendar"
                readonly
                @click="openDatePicker('maintenanceExpireTime')"
              />
            </view>
          </view>
        </view>
      </view>

      <!-- 6. 算力服务 -->
      <view class="form-module">
        <view class="module-header" @click="toggleModule('cloud')">
          <view class="title-left">
            <view class="blue-dot"></view>
            <text class="title-text">算力服务</text>
          </view>
          <view class="collapse-action">
            <text class="action-text">{{
              collapses.cloud ? "展开" : "折叠"
            }}</text>
            <wd-icon
              :name="collapses.cloud ? 'arrow-down' : 'arrow-up'"
              size="16px"
              color="#999"
            />
          </view>
        </view>
        <view v-show="!collapses.cloud" class="module-body">
          <view class="field-row">
            <view class="field-item flex-1">
              <view class="field-label">月服务费</view>
              <wd-input
                v-model="formData.cloudServiceFee"
                placeholder="请输入"
                no-border
              />
            </view>
          </view>
          <view class="field-row">
            <view class="field-item flex-1">
              <view class="field-label">到期开始时间</view>
              <wd-input
                v-model="formData.cloudExpiredStartTime"
                placeholder="选择日期"
                no-border
                suffix-icon="calendar"
                readonly
                @click="openDatePicker('cloudExpiredStartTime')"
              />
            </view>
            <view class="field-item flex-1">
              <view class="field-label">到期时间</view>
              <wd-input
                v-model="formData.cloudExpireTime"
                placeholder="选择日期"
                no-border
                suffix-icon="calendar"
                readonly
                @click="openDatePicker('cloudExpireTime')"
              />
            </view>
          </view>
        </view>
      </view>

      <!-- 7. 电竞云宽带服务 -->
      <view class="form-module">
        <view class="module-header" @click="toggleModule('cloudBroadband')">
          <view class="title-left">
            <view class="blue-dot"></view>
            <text class="title-text">电竞云宽带服务</text>
          </view>
          <view class="collapse-action">
            <text class="action-text">{{
              collapses.cloudBroadband ? "展开" : "折叠"
            }}</text>
            <wd-icon
              :name="collapses.cloudBroadband ? 'arrow-down' : 'arrow-up'"
              size="16px"
              color="#999"
            />
          </view>
        </view>
        <view v-show="!collapses.cloudBroadband" class="module-body">
          <view class="field-item">
            <view class="field-label">运营商</view>
            <DictSelectPicker
              v-model="formData.cloudBroadbandCarrier"
              dict-key="CARRIER_CATEGORY"
              title="选择运营商"
            />
          </view>
          <view class="field-item">
            <view class="field-label">年服务费</view>
            <wd-input
              v-model="formData.cloudBroadbandProjectFee"
              placeholder="请输入"
              no-border
            />
          </view>
          <view class="field-item">
            <view class="field-label">线路编码</view>
            <wd-input
              v-model="formData.cloudBroadbandLineCode"
              placeholder="请输入线路编码"
              no-border
            />
          </view>
          <view class="field-row">
            <view class="field-item flex-1">
              <view class="field-label">到期开始时间</view>
              <wd-input
                v-model="formData.cloudBroadbandExpiredStartTime"
                placeholder="选择日期"
                no-border
                suffix-icon="calendar"
                readonly
                @click="openDatePicker('cloudBroadbandExpiredStartTime')"
              />
            </view>
            <view class="field-item flex-1">
              <view class="field-label">到期时间</view>
              <wd-input
                v-model="formData.cloudBroadbandExpiredTime"
                placeholder="选择日期"
                no-border
                suffix-icon="calendar"
                readonly
                @click="openDatePicker('cloudBroadbandExpiredTime')"
              />
            </view>
          </view>
        </view>
      </view>

      <!-- 8. 人脸设备 -->
      <view class="form-module">
        <view class="module-header" @click="toggleModule('face')">
          <view class="title-left">
            <view class="blue-dot"></view>
            <text class="title-text">人脸设备</text>
          </view>
          <view class="collapse-action">
            <text class="action-text">{{
              collapses.face ? "展开" : "折叠"
            }}</text>
            <wd-icon
              :name="collapses.face ? 'arrow-down' : 'arrow-up'"
              size="16px"
              color="#999"
            />
          </view>
        </view>
        <view v-show="!collapses.face" class="module-body">
          <view class="field-item">
            <view class="field-label">设备类型</view>
            <DictSelectPicker
              v-model="formData.faceDeviceType"
              dict-key="WJ_FACE_DEVICE"
              title="选择设备类型"
            />
          </view>
        </view>
      </view>
    </view>

    <!-- 底部保存操作区 -->
    <view class="fixed-bottom-btns">
      <wd-button
        type="primary"
        block
        class="flex-btn"
        :loading="submitting"
        @click="handleSubmit"
        >保存</wd-button
      >
    </view>

    <!-- 日期选择器 -->
    <wd-datetime-picker
      :visible="datePickerVisible"
      v-model="datePickerModel"
      type="datetime"
      title="选择日期"
      @confirm="onDatePickerConfirm"
      @cancel="datePickerVisible = false"
    />

    <!-- 省市区选择器 -->
    <wd-picker
      :visible="areaPickerVisible"
      :columns="areaColumns"
      v-model="areaPickerValue"
      cascade
      title="选择省市区"
      @confirm="onAreaPickerConfirm"
      @cancel="areaPickerVisible = false"
    />

    <!-- 派出所选择器 -->
    <wd-picker
      :visible="policePickerVisible"
      :columns="policeColumns"
      v-model="policePickerValue"
      cascade
      title="选择派出所"
      @confirm="onPolicePickerConfirm"
      @cancel="policePickerVisible = false"
    />
  </view>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getCustomerDetail, editCustomer } from "@/api";
import ImgUpload from "../../components/ImgUpload.vue";
import DictSelectPicker from "../../components/DictSelectPicker.vue";
import {
  loadAddressData,
  getProvinces,
  getCities,
  getDistricts,
} from "@/utils/tools";
import {
  loadPoliceStationData,
  getPoliceDistrictList,
  getPoliceStationList,
} from "@/utils/tools";

// 模块折叠状态
const collapses = ref({
  basic: false,
  contact: false,
  company: false,
  pubwin: false,
  maintenance: false,
  cloud: false,
  cloudBroadband: false,
  face: false,
});

// 表单数据
const formData = reactive({
  id: "",
  storeName: "",
  areaCode: {},
  address: "",
  longitude: "",
  latitude: "",
  businessStatus: undefined,
  category: undefined,
  chainCode: undefined,
  policeStation: "",
  pubwinRegNo: "",
  remark: "",
  contactList: [{ contactName: "", phone: "", remark: "" }],
  companyName: "",
  legalPerson: "",
  licenseNo: "",
  businessLicenseUrl: "",
  // 服务模块
  pubwinMachineCount: undefined,
  pubwinServiceFee: undefined,
  pubwinExpiredStartTime: "",
  pubwinExpireTime: "",
  billingServiceId: undefined,
  maintenanceCompany: undefined,
  maintenanceFee: undefined,
  maintenanceExpiredStartTime: "",
  maintenanceExpireTime: "",
  maintenanceServiceId: undefined,
  cloudServiceFee: undefined,
  cloudExpiredStartTime: "",
  cloudExpireTime: "",
  cloudServiceId: undefined,
  cloudBroadbandCarrier: undefined,
  cloudBroadbandProjectFee: undefined,
  cloudBroadbandLineCode: "",
  cloudBroadbandExpiredStartTime: "",
  cloudBroadbandExpiredTime: "",
  cloudBroadbandServiceId: undefined,
  faceDeviceType: undefined,
  faceServiceId: undefined,
});

const submitting = ref(false);

// 省市区显示
const areaDisplay = computed(() => {
  const { province, city, county } = formData.areaCode || {};
  const parts = [province, city, county].filter(Boolean);
  return parts.length ? parts.join(" / ") : "";
});

// ========== 日期选择器 ==========
const datePickerVisible = ref(false);
const datePickerModel = ref(Date.now());
let currentDateField = "";

function openDatePicker(field) {
  currentDateField = field;
  datePickerModel.value = formData[field]
    ? new Date(formData[field]).getTime()
    : Date.now();
  console.log(datePickerModel);

  datePickerVisible.value = true;
}

function onDatePickerConfirm({ value }) {
  const d = new Date(value);
  const padNum = (n) => String(n).padStart(2, "0");
  // 格式化日期为yyyy-MM-dd HH:mm:ss
  formData[currentDateField] =
    `${d.getFullYear()}-${padNum(d.getMonth() + 1)}-${padNum(d.getDate())} ${padNum(d.getHours())}:${padNum(d.getMinutes())}:00`;
  datePickerVisible.value = false;
}

// ========== 省市区选择器（cascade 三级联动） ==========
const areaPickerVisible = ref(false);
const areaPickerValue = ref([]);

function buildAreaTree() {
  const provinces = getProvinces();
  return provinces.map((p) => ({
    label: p.name,
    value: p.code,
    children: getCities(p.code).map((c) => ({
      label: c.name,
      value: c.code,
      children: getDistricts(c.code).map((d) => ({
        label: d.name,
        value: d.code,
      })),
    })),
  }));
}

const areaColumns = ref([]);
function handleExtraData(data) {
  formData.businessLicenseUrl = data.businessLicenseUrl;
  formData.licenseNo = data.businessLicenseCode;
  formData.legalPerson = data.legalPerson;
  formData.companyName = data.subjectName;
}

function openAreaPicker() {
  if (!getProvinces().length) {
    uni.showToast({ title: "地址数据加载中", icon: "none" });
    return;
  }
  areaColumns.value = buildAreaTree();

  // 回填已选值
  const cur = formData.areaCode || {};
  areaPickerValue.value = [
    cur.provCode || "",
    cur.cityCode || "",
    cur.countyCode || "",
  ].filter(Boolean);

  areaPickerVisible.value = true;
}

function onAreaPickerConfirm({ value }) {
  // cascade模式下 value 是各级选择值的数组
  const [provCode, cityCode, countyCode] = value || [];
  formData.areaCode = {
    provCode: provCode || "",
    province: findLabel(areaColumns.value, provCode) || "",
    cityCode: cityCode || "",
    city: findChildLabel(areaColumns.value, provCode, cityCode) || "",
    countyCode: countyCode || "",
    county:
      findGrandChildLabel(areaColumns.value, provCode, cityCode, countyCode) ||
      "",
  };

  areaPickerVisible.value = false;
}

function findLabel(tree, code) {
  for (const item of tree) {
    if (item.value === code) return item.label;
  }
  return "";
}
function findChildLabel(tree, parentCode, code) {
  const parent = tree.find((i) => i.value === parentCode);
  if (parent?.children) {
    for (const item of parent.children) {
      if (item.value === code) return item.label;
    }
  }
  return "";
}
function findGrandChildLabel(tree, provCode, cityCode, code) {
  const prov = tree.find((i) => i.value === provCode);
  const city = prov?.children?.find((i) => i.value === cityCode);
  if (city?.children) {
    for (const item of city.children) {
      if (item.value === code) return item.label;
    }
  }
  return "";
}

// ========== 派出所选择器（独立2级级联：区/县 → 派出所） ==========
const policePickerVisible = ref(false);
const policePickerValue = ref([]);
const policeColumns = ref([]);

function buildPoliceTree() {
  const districts = getPoliceDistrictList();
  return districts.map((d) => ({
    label: d,
    value: d,
    children: getPoliceStationList(d).map((s) => ({
      label: s,
      value: s,
    })),
  }));
}

function openPolicePicker() {
  if (!getPoliceDistrictList().length) {
    uni.showToast({ title: "派出所数据加载中", icon: "none" });
    return;
  }

  policeColumns.value = buildPoliceTree();

  if (formData.policeStation) {
    // 有已有值：查找该派出所属于哪个区
    let foundDistrict = "";
    for (const d of getPoliceDistrictList()) {
      if (getPoliceStationList(d).includes(formData.policeStation)) {
        foundDistrict = d;
        break;
      }
    }
    policePickerValue.value = foundDistrict
      ? [foundDistrict, formData.policeStation]
      : [formData.policeStation];
  } else {
    // 无已有值：默认选中第一项使cascade展开两列
    const districts = getPoliceDistrictList();
    const firstStations = getPoliceStationList(districts[0]);
    policePickerValue.value = [districts[0], firstStations[0] || ""];
  }

  policePickerVisible.value = true;
}

function onPolicePickerConfirm({ value }) {
  // cascade模式下 value 是数组 [districtName, stationName]
  if (Array.isArray(value)) {
    formData.policeStation = value[value.length - 1] || "";
  } else {
    formData.policeStation = value || "";
  }
  policePickerVisible.value = false;
}

// ========== 联系人操作 ==========
function pad(n) {
  return String(n).padStart(2, "0");
}
function addContact() {
  formData.contactList.push({ contactName: "", phone: "", remark: "" });
}
function removeContact(idx) {
  formData.contactList.splice(idx, 1);
}

// ========== 模块折叠 ==========
function toggleModule(key) {
  collapses.value[key] = !collapses.value[key];
}

function goBack() {
  uni.navigateBack();
}

// ========== 加载详情 ==========
async function loadDetail(id) {
  try {
    const res = await getCustomerDetail({ id });
    const store = res.store || {};
    const contactList = res.contactList || [];
    const enterprise = res.enterprise || {};
    const serviceList = res.serviceList || [];

    const areaCode = {};
    if (store.provinceCode) areaCode.provCode = store.provinceCode;
    if (store.provinceName || store.province)
      areaCode.province = store.provinceName || store.province;
    if (store.cityCode) areaCode.cityCode = store.cityCode;
    if (store.cityName || store.city)
      areaCode.city = store.cityName || store.city;
    if (store.districtCode) areaCode.countyCode = store.districtCode;
    if (store.districtName || store.district)
      areaCode.county = store.districtName || store.district;

    let billing = {};
    let maintenance = {};
    let cloud = {};
    let cloudBroadband = {};
    let face = {};

    serviceList.forEach((item) => {
      switch (item.serviceType) {
        case "BILLING":
          billing = item;
          break;
        case "MAINTENANCE":
          maintenance = item;
          break;
        case "CLOUD_BOX":
          cloud = item;
          break;
        case "CLOUD_BROADBAND":
          cloudBroadband = item;
          break;
        case "FACE_DEVICE":
          face = item;
          break;
      }
    });

    Object.assign(formData, {
      id: store.id || "",
      storeName: store.storeName || "",
      areaCode,
      address: store.address || "",
      longitude: store.longitude ? String(store.longitude) : "",
      latitude: store.latitude ? String(store.latitude) : "",
      businessStatus: store.businessStatus,
      category: store.category,
      chainCode: store.chainCode || undefined,
      policeStation: store.policeStation || "",
      pubwinRegNo: store.pubwinId || "",
      remark: store.remark || "",
      contactList: contactList.length
        ? contactList.map((c) => ({
            id: c.id,
            contactName: c.contactName || "",
            phone: c.contactPhone || "",
            remark: c.remark || "",
          }))
        : [{ contactName: "", phone: "", remark: "" }],
      companyName: enterprise.subjectName || "",
      legalPerson: enterprise.legalPerson || "",
      licenseNo: enterprise.businessLicenseCode || "",
      businessLicenseUrl: enterprise.businessLicenseUrl || "",
      pubwinMachineCount: billing.machineCount,
      pubwinServiceFee: billing.projectFee,
      pubwinExpiredStartTime: billing.expiredStartTime || "",
      pubwinExpireTime: billing.expiredTime || "",
      billingServiceId: billing.id,
      maintenanceCompany: maintenance.maintenanceCompany,
      maintenanceFee: maintenance.projectFee,
      maintenanceExpiredStartTime: maintenance.expiredStartTime || "",
      maintenanceExpireTime: maintenance.expiredTime || "",
      maintenanceServiceId: maintenance.id,
      cloudServiceFee: cloud.projectFee,
      cloudExpiredStartTime: cloud.expiredStartTime || "",
      cloudExpireTime: cloud.expiredTime || "",
      cloudServiceId: cloud.id,
      cloudBroadbandCarrier: cloudBroadband.carrier,
      cloudBroadbandProjectFee: cloudBroadband.projectFee,
      cloudBroadbandLineCode: cloudBroadband.lineCode || "",
      cloudBroadbandExpiredStartTime: cloudBroadband.expiredStartTime || "",
      cloudBroadbandExpiredTime: cloudBroadband.expiredTime || "",
      cloudBroadbandServiceId: cloudBroadband.id,
      faceDeviceType: face.faceDeviceType,
      faceServiceId: face.id,
    });
  } catch (error) {
    console.error("加载详情失败", error);
    uni.showToast({ title: "加载失败", icon: "none" });
  }
}

// ========== 构建提交数据 ==========
function buildSubmitData() {
  const area = formData.areaCode || {};
  return {
    id: formData.id || "",
    storeName: formData.storeName,
    address: formData.address || "",
    longitude: formData.longitude ? parseFloat(formData.longitude) : "",
    latitude: formData.latitude ? parseFloat(formData.latitude) : "",
    businessStatus: formData.businessStatus,
    category: formData.category,
    chainCode: formData.chainCode || "",
    provinceCode: area.provCode || "",
    cityCode: area.cityCode || "",
    districtCode: area.countyCode || "",
    provinceName: area.province || "",
    cityName: area.city || "",
    districtName: area.county || "",
    policeStation: formData.policeStation || "",
    pubwinId: formData.pubwinRegNo || "",
    remark: formData.remark || "",
    contactList: (formData.contactList || [])
      .filter((c) => c.contactName || c.phone)
      .map((c) => ({
        id: c.id,
        contactName: c.contactName,
        contactPhone: c.phone,
        remark: c.remark || "",
      })),
    enterprise: {
      subjectName: formData.companyName || "",
      legalPerson: formData.legalPerson || "",
      businessLicenseCode: formData.licenseNo || "",
      businessLicenseUrl: formData.businessLicenseUrl || "",
    },
    serviceList: [
      {
        id: formData.billingServiceId || "",
        serviceType: "BILLING",
        machineCount: formData.pubwinMachineCount ?? "",
        projectFee: formData.pubwinServiceFee ?? 0,
        expiredStartTime: formData.pubwinExpiredStartTime || "",
        expiredTime: formData.pubwinExpireTime || "",
      },
      {
        id: formData.maintenanceServiceId || "",
        serviceType: "MAINTENANCE",
        maintenanceCompany: formData.maintenanceCompany || "",
        projectFee: formData.maintenanceFee ?? 0,
        expiredStartTime: formData.maintenanceExpiredStartTime || "",
        expiredTime: formData.maintenanceExpireTime || "",
      },
      {
        id: formData.cloudServiceId || "",
        serviceType: "CLOUD_BOX",
        projectFee: formData.cloudServiceFee ?? 0,
        expiredStartTime: formData.cloudExpiredStartTime || "",
        expiredTime: formData.cloudExpireTime || "",
      },
      {
        id: formData.cloudBroadbandServiceId || "",
        serviceType: "CLOUD_BROADBAND",
        carrier: formData.cloudBroadbandCarrier || "",
        projectFee: formData.cloudBroadbandProjectFee ?? 0,
        lineCode: formData.cloudBroadbandLineCode || "",
        expiredStartTime: formData.cloudBroadbandExpiredStartTime || "",
        expiredTime: formData.cloudBroadbandExpiredTime || "",
      },
      {
        id: formData.faceServiceId || "",
        serviceType: "FACE_DEVICE",
        faceDeviceType: formData.faceDeviceType || "",
        projectFee: 0,
        expiredStartTime: "",
        expiredTime: "",
      },
    ],
  };
}

// ========== 提交 ==========
async function handleSubmit() {
  if (submitting.value) return;
  submitting.value = true;
  try {
    const data = buildSubmitData();
    await editCustomer(data);
    uni.showToast({ title: "保存成功", icon: "success" });
    // setTimeout(() => uni.navigateBack(), 1500);
  } catch (error) {
    console.error("保存失败", error);
    uni.showToast({ title: "保存失败", icon: "none" });
  } finally {
    submitting.value = false;
  }
}

onLoad((options) => {
  loadAddressData();
  loadPoliceStationData();
  if (options.id) {
    loadDetail(options.id);
  }
});
</script>

<style scoped lang="scss">
.page {
  width: 100%;
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 180rpx;
}
.form-container {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

/* 模块卡片 */
.form-module {
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);

  .module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 28rpx 32rpx;
    background-color: #ffffff;
    border-bottom: 1px solid #f6f7f9;

    .title-left {
      display: flex;
      align-items: center;
      gap: 16rpx;
      .blue-dot {
        width: 14rpx;
        height: 14rpx;
        background-color: #0066ff;
        border-radius: 50%;
      }
      .title-text {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
      }
    }

    .collapse-action {
      display: flex;
      align-items: center;
      gap: 12rpx;
      .action-text {
        font-size: 26rpx;
        color: #999;
      }
      .action-btn-text {
        font-size: 26rpx;
        color: #0066ff;
        font-weight: 500;
        margin-right: 12rpx;
      }
    }
  }

  .module-body {
    padding: 24rpx 32rpx 32rpx;
  }
}

/* 表单字段 */
.field-item {
  margin-bottom: 24rpx;
  &:last-child {
    margin-bottom: 0;
  }

  .field-label {
    font-size: 26rpx;
    color: #333;
    margin-bottom: 12rpx;
    font-weight: 500;
  }

  :deep(.wd-input) {
    background-color: #f8f9fa;
    border-radius: 12rpx;
    padding: 16rpx 24rpx;
  }
}

.field-row {
  display: flex;
  gap: 20rpx;
  .flex-1 {
    flex: 1;
  }
}

/* 联系人子卡片 */
.sub-card {
  border: 1px solid #eef3fb;
  border-radius: 12rpx;
  padding: 24rpx;
  background-color: #fff;
  margin-bottom: 16rpx;

  .sub-card-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    .tag-idx {
      background-color: #0066ff;
      color: #fff;
      font-size: 22rpx;
      font-weight: bold;
      padding: 2rpx 10rpx;
      border-radius: 6rpx;
      margin-right: 14rpx;
    }
    .sub-title {
      font-size: 28rpx;
      font-weight: bold;
      color: #333;
      flex: 1;
    }
    .sub-actions {
      display: flex;
    }
  }
}

.sub-card-content {
  .field-item {
    margin-bottom: 16rpx;
    :deep(.wd-input) {
      background-color: #f8f9fa;
      border-radius: 8rpx;
      padding: 12rpx 20rpx;
    }
  }
}

.empty-tip {
  text-align: center;
  color: #999;
  font-size: 26rpx;
  padding: 40rpx 0;
}

/* 上传区域 */
.upload-box {
  margin-top: 28rpx;
  .upload-title {
    font-size: 26rpx;
    color: #333;
    margin-bottom: 16rpx;
  }
  .upload-tip {
    font-size: 22rpx;
    color: #ef4444;
    display: block;
    margin-top: 12rpx;
  }
}

/* 底部操作 */
.fixed-bottom-btns {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  padding: 24rpx 32rpx;
  display: flex;
  gap: 24rpx;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);
  z-index: 1;
  .flex-btn {
    flex: 1;
  }
}
</style>
